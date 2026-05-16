import { AxiosInstance } from 'axios';
import { stringify } from 'query-string';
import { DataProvider } from '@refinedev/core';
import { axiosInstance, generateSort, generateFilter } from './utils';

type MethodTypes = 'get' | 'delete' | 'head' | 'options';
type MethodTypesWithBody = 'post' | 'put' | 'patch';

export const dataProvider = (
  apiUrl: string,
  prefix: string | '' = '',
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  'createMany' | 'updateMany' | 'deleteMany'
> => ({
  getList: async ({ resource, meta }) => {
    const url = `${apiUrl}${prefix}/${resource}`;

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const { data, headers } = await httpClient[requestMethod](url, {
      headers: headersFromMeta,
    });

    const total = +headers['x-total-count'];

    return {
      data,
      total: total || data.length,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const { data } = await httpClient[requestMethod](
      `${apiUrl}${prefix}/${resource}?${stringify({ id: ids })}`,
      { headers }
    );

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}${prefix}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'post';

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}${prefix}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'patch';

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}${prefix}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? 'get';

    const { data } = await httpClient[requestMethod](url, { headers });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}${prefix}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? 'delete';

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return `${apiUrl}${prefix}`;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
  }) => {
    let requestUrl = `${url}`;
    const querySegments: string[] = [];

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = stringify(
          {
            _sort: _sort.join(','),
            _order: _order.join(','),
          },
          { skipEmptyString: true, skipNull: true }
        );

        if (sortQuery) {
          querySegments.push(sortQuery);
        }
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      const filterQueryString = stringify(filterQuery, {
        skipEmptyString: true,
        skipNull: true,
      });
      if (filterQueryString) {
        querySegments.push(filterQueryString);
      }
    }

    if (query) {
      const queryString = stringify(query, {
        skipEmptyString: true,
        skipNull: true,
      });
      if (queryString) {
        querySegments.push(queryString);
      }
    }

    if (querySegments.length) {
      const separator = requestUrl.includes('?') ? '&' : '?';
      requestUrl = `${requestUrl}${separator}${querySegments.join('&')}`;
    }

    let axiosResponse;
    switch (method) {
      case 'put':
      case 'post':
      case 'patch':
        axiosResponse = await httpClient[method](url, payload);
        break;
      case 'delete':
        axiosResponse = await httpClient.delete(url, {
          data: payload,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl);
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});
