import { IPaginationData } from "../common/types/utils";
const createPaginationData = (
  page: number,
  limit: number,
  totalCount: number,
  resource: string
): IPaginationData => {
  return {
    page,
    limit,
    totalPage: Math.ceil(totalCount / limit),
    ["total" + resource]: totalCount,
  };
};

export default {
  createPaginationData,
};
