import { db } from '../config/database';
import { EmbeddingService } from './EmbeddingService';

export interface SearchParams {
  query: string;
  type?: 'metadata' | 'fulltext' | 'semantic' | 'ocr';
  agency_id?: string;
  record_type?: string;
  date_from?: string;
  date_to?: string;
  tags?: string[];
  page?: number;
  size?: number;
}

export class SearchService {
  private embeddingService = new EmbeddingService();

  async search(params: SearchParams) {
    const { query, type = 'fulltext', agency_id, record_type, date_from, date_to, tags, page = 1, size = 20 } = params;
    const offset = (page - 1) * size;

    let baseQuery = db('records')
      .leftJoin('agencies', 'records.agency_id', 'agencies.id')
      .leftJoin('record_tags', 'records.id', 'record_tags.record_id');

    // Apply filters
    if (agency_id) {
      baseQuery = baseQuery.where('records.agency_id', agency_id);
    }
    if (record_type) {
      baseQuery = baseQuery.where('records.media_type', record_type);
    }
    if (date_from) {
      baseQuery = baseQuery.where('records.created_at', '>=', date_from);
    }
    if (date_to) {
      baseQuery = baseQuery.where('records.created_at', '<=', date_to);
    }
    if (tags?.length) {
      baseQuery = baseQuery.whereIn('record_tags.tag', tags);
    }

    // Build search condition based on type
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .map(term => term + ':*')
      .join(' & ');

    let searchQuery;
    if (type === 'metadata') {
      // Search title, series_title, media_type
      searchQuery = baseQuery.clone()
        .whereRaw(
          `to_tsvector('english', coalesce(records.title, '') || ' ' || coalesce(records.series_title, '') || ' ' || coalesce(records.media_type, '')) @@ to_tsquery('english', ?)`,
          [tsQuery]
        );
    } else if (type === 'ocr') {
      // Search description (where OCR text would be stored)
      searchQuery = baseQuery.clone()
        .whereRaw(
          `to_tsvector('english', coalesce(records.description, '')) @@ to_tsquery('english', ?)`,
          [tsQuery]
        );
    } else if (type === 'semantic') {
      // Semantic search via pgvector + Bedrock Titan Embeddings
      const semanticResults = await this.embeddingService.semanticSearch(query, size, offset, { agency_id });
      return {
        hits: semanticResults.map((hit: any) => ({
          id: hit.id,
          score: parseFloat(hit.score) || 0,
          title: hit.title,
          description: hit.description,
          series_title: hit.series_title,
          media_type: hit.media_type,
          status: hit.status,
          agency_id: hit.agency_id,
          agency_name: null,
          agency_code: hit.agency_code,
          location_code: hit.location_code,
          created_at: hit.created_at,
          highlights: {},
        })),
        total: semanticResults.length,
        facets: { record_types: [], agencies: [], date_histogram: [] },
      };
    } else {
      // fulltext — search across all text fields
      searchQuery = baseQuery.clone()
        .whereRaw(
          `to_tsvector('english', coalesce(records.title, '') || ' ' || coalesce(records.description, '') || ' ' || coalesce(records.series_title, '')) @@ to_tsquery('english', ?)`,
          [tsQuery]
        );
    }

    // Count total results
    const countResult = await searchQuery.clone()
      .countDistinct('records.id as count')
      .first();
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Fetch results with ranking
    const hits = await searchQuery.clone()
      .select(
        'records.id',
        'records.title',
        'records.description',
        'records.series_title',
        'records.media_type',
        'records.status',
        'records.agency_id',
        'records.agency_code',
        'records.created_at',
        'records.location_code',
        'agencies.name as agency_name',
        db.raw(
          `ts_rank(to_tsvector('english', coalesce(records.title, '') || ' ' || coalesce(records.description, '') || ' ' || coalesce(records.series_title, '')), to_tsquery('english', ?)) as score`,
          [tsQuery]
        ),
        db.raw(
          `ts_headline('english', coalesce(records.title, '') || ' ' || coalesce(records.description, ''), to_tsquery('english', ?), 'MaxFragments=2,MaxWords=30') as headline`,
          [tsQuery]
        )
      )
      .groupBy('records.id', 'agencies.name')
      .orderBy('score', 'desc')
      .limit(size)
      .offset(offset);

    // Get facets (aggregations)
    const [typeFacets, agencyFacets] = await Promise.all([
      db('records')
        .select('media_type')
        .count('* as doc_count')
        .groupBy('media_type')
        .orderBy('doc_count', 'desc')
        .limit(20),
      db('records')
        .select('agency_id')
        .count('* as doc_count')
        .groupBy('agency_id')
        .orderBy('doc_count', 'desc')
        .limit(50),
    ]);

    return {
      hits: hits.map((hit: any) => ({
        id: hit.id,
        score: parseFloat(hit.score) || 0,
        title: hit.title,
        description: hit.description,
        series_title: hit.series_title,
        media_type: hit.media_type,
        status: hit.status,
        agency_id: hit.agency_id,
        agency_name: hit.agency_name,
        agency_code: hit.agency_code,
        location_code: hit.location_code,
        created_at: hit.created_at,
        highlights: { title: [hit.headline] },
      })),
      total,
      facets: {
        record_types: typeFacets.map((r: any) => ({ key: r.media_type, doc_count: parseInt(r.doc_count) })),
        agencies: agencyFacets.map((r: any) => ({ key: r.agency_id, doc_count: parseInt(r.doc_count) })),
        date_histogram: [],
      },
    };
  }

  async getFacets(agencyId?: string) {
    let query = db('records');
    if (agencyId) {
      query = query.where('agency_id', agencyId);
    }

    const [typeFacets, tagFacets, statusFacets] = await Promise.all([
      query.clone()
        .select('media_type as key')
        .count('* as doc_count')
        .groupBy('media_type')
        .orderBy('doc_count', 'desc')
        .limit(50),
      db('record_tags')
        .modify((qb) => {
          if (agencyId) {
            qb.whereIn('record_id', db('records').select('id').where('agency_id', agencyId));
          }
        })
        .select('tag as key')
        .count('* as doc_count')
        .groupBy('tag')
        .orderBy('doc_count', 'desc')
        .limit(100),
      query.clone()
        .select('status as key')
        .count('* as doc_count')
        .groupBy('status')
        .orderBy('doc_count', 'desc')
        .limit(10),
    ]);

    return {
      record_types: typeFacets.map((r: any) => ({ key: r.key, doc_count: parseInt(r.doc_count) })),
      tags: tagFacets.map((r: any) => ({ key: r.key, doc_count: parseInt(r.doc_count) })),
      statuses: statusFacets.map((r: any) => ({ key: r.key, doc_count: parseInt(r.doc_count) })),
    };
  }
}