export { PortfolioResolver } from './portfolio.resolver';
export { BlogsResolver } from './blogs.resolver';
export { CollectionPageResolver } from './collection-page.resolver';
export { CollectionsResolver } from './collections.resolver';
export { HistoryResolver } from './history.resolver';
export { WorksResolver } from './works.resolver';

import { PortfolioResolver } from './portfolio.resolver';
import { BlogsResolver } from './blogs.resolver';
import { CollectionPageResolver } from './collection-page.resolver';
import { CollectionsResolver } from './collections.resolver';
import { HistoryResolver } from './history.resolver';
import { WorksResolver } from './works.resolver';

export const PortfolioResolvers = [
    PortfolioResolver,
    BlogsResolver,
    CollectionPageResolver,
    CollectionsResolver,
    HistoryResolver,
    WorksResolver,
];
