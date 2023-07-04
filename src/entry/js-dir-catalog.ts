import { FacetRemove } from '@/scripts/catalog/facet-remove'
import { FacetFiltersForm, initializeFacetFiltersForm } from '@/scripts/catalog/facet-filters-form'
import { MainSearch } from '@/scripts/catalog/main-search'
import { PredictiveSearch } from '@/scripts/catalog/predictive-search'
import { PriceRange } from '@/scripts/catalog/price-range'
import { SearchForm } from '@/scripts/catalog/search-form'
import { safeDefineElement } from '@/scripts/functions';

safeDefineElement(FacetFiltersForm, undefined, initializeFacetFiltersForm)
safeDefineElement(PriceRange)
safeDefineElement(FacetRemove)
safeDefineElement(MainSearch)
safeDefineElement(PredictiveSearch)
safeDefineElement(SearchForm)
