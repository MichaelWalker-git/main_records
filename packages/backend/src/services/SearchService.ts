import { Client } from '@opensearch-project/opensearch';
import { config } from '../config';

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
  private client: Client;

  constructor() {
    this.client = new Client({
      node: config.opensearchEndpoint,
    });
  }

  async search(params: SearchParams) {
    const { query, type = 'fulltext', agency_id, record_type, date_from, date_to, tags, page = 1, size = 20 } = params;

    const must: any[] = [];
    const filter: any[] = [];

    if (type === 'semantic') {
      must.push({ neural: { content_embedding: { query, model_id: 'bedrock-embedding', k: size } } });
    } else if (type === 'ocr') {
      must.push({ match: { ocr_text: { query, fuzziness: 'AUTO' } } });
    } else if (type === 'metadata') {
      must.push({
        multi_match: { query, fields: ['title^3', 'description^2', 'tags', 'record_type'], type: 'best_fields' },
      });
    } else {
      must.push({ multi_match: { query, fields: ['title^3', 'description^2', 'content', 'ocr_text', 'tags'] } });
    }

    if (agency_id) filter.push({ term: { agency_id } });
    if (record_type) filter.push({ term: { record_type } });
    if (tags?.length) filter.push({ terms: { tags } });
    if (date_from || date_to) {
      const range: any = {};
      if (date_from) range.gte = date_from;
      if (date_to) range.lte = date_to;
      filter.push({ range: { created_at: range } });
    }

    const body: any = {
      from: (page - 1) * size,
      size,
      query: { bool: { must, filter } },
      highlight: { fields: { content: {}, title: {}, description: {} } },
      aggs: {
        record_types: { terms: { field: 'record_type', size: 20 } },
        agencies: { terms: { field: 'agency_id', size: 50 } },
        date_histogram: { date_histogram: { field: 'created_at', calendar_interval: 'month' } },
      },
    };

    const response = await this.client.search({ index: 'records', body });

    return {
      hits: response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
        highlights: hit.highlight,
      })),
      total: response.body.hits.total.value,
      facets: {
        record_types: response.body.aggregations?.record_types?.buckets || [],
        agencies: response.body.aggregations?.agencies?.buckets || [],
        date_histogram: response.body.aggregations?.date_histogram?.buckets || [],
      },
    };
  }

  async getFacets(agencyId?: string) {
    const body: any = {
      size: 0,
      aggs: {
        record_types: { terms: { field: 'record_type', size: 50 } },
        tags: { terms: { field: 'tags', size: 100 } },
        statuses: { terms: { field: 'status', size: 10 } },
      },
    };

    if (agencyId) {
      body.query = { term: { agency_id: agencyId } };
    }

    const response = await this.client.search({ index: 'records', body });
    return {
      record_types: response.body.aggregations?.record_types?.buckets || [],
      tags: response.body.aggregations?.tags?.buckets || [],
      statuses: response.body.aggregations?.statuses?.buckets || [],
    };
  }
}
