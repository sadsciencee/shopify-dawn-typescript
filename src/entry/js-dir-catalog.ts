import { safeDefineElement } from '@/scripts/functions'

import { FacetFiltersForm, beforeFacetFiltersForm, afterFacetFiltersForm } from '@/scripts/catalog/facet-filters-form'
import { PriceRange } from '@/scripts/catalog/price-range'
import { FacetRemove } from '@/scripts/catalog/facet-remove'
import { MainSearch } from '@/scripts/catalog/main-search'
import { ShowMoreButton } from '@/scripts/catalog/show-more-button';

safeDefineElement(FacetFiltersForm, beforeFacetFiltersForm, afterFacetFiltersForm)
safeDefineElement(PriceRange)
safeDefineElement(FacetRemove)
safeDefineElement(MainSearch)
safeDefineElement(ShowMoreButton)
