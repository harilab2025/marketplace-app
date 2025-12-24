# 🚀 Advanced Hybrid Approaches

## Current Implementation vs Advanced Options

### Current Implementation: Length-Based

```typescript
// Current: Simple length check
const shouldUseElasticsearch = () => {
    return search && search.trim().length > 2;
};
```

**Pros:**
- ✅ Simple dan mudah dipahami
- ✅ Predictable behavior
- ✅ Fast decision making
- ✅ Easy to debug

**Cons:**
- ❌ Tidak consider kompleksitas query
- ❌ Tidak ada fallback mechanism
- ❌ Tidak consider performance metrics
- ❌ Tidak ada query intent detection

---

## Alternative Hybrid Approaches

### 1. 🧠 Query Complexity Analysis (RECOMMENDED)

Analisis kompleksitas query untuk decision yang lebih smart.

```typescript
// Advanced: Query complexity analysis
const analyzeQueryComplexity = (query: string) => {
    if (!query || query.trim().length < 2) {
        return { method: 'database', reason: 'empty_or_short' };
    }

    const trimmed = query.trim();
    const length = trimmed.length;
    const hasSpecialChars = /[*?"~]/.test(trimmed);
    const hasMultipleWords = trimmed.split(/\s+/).length > 1;
    const hasWildcard = /\*/.test(trimmed);
    const isExactMatch = /^".*"$/.test(trimmed);

    // Exact match query - better in Database
    if (isExactMatch) {
        return {
            method: 'database',
            reason: 'exact_match',
            query: trimmed.replace(/"/g, '')
        };
    }

    // Wildcard query - Elasticsearch
    if (hasWildcard) {
        return { method: 'elasticsearch', reason: 'wildcard' };
    }

    // Multi-word search - Elasticsearch (better relevance)
    if (hasMultipleWords && length > 5) {
        return { method: 'elasticsearch', reason: 'multi_word' };
    }

    // Special search operators - Elasticsearch
    if (hasSpecialChars) {
        return { method: 'elasticsearch', reason: 'special_chars' };
    }

    // Long query - Elasticsearch (full-text better)
    if (length > 10) {
        return { method: 'elasticsearch', reason: 'long_query' };
    }

    // Medium query - Elasticsearch
    if (length > 2) {
        return { method: 'elasticsearch', reason: 'standard_search' };
    }

    // Short query - Database
    return { method: 'database', reason: 'short_query' };
};

// Usage in useEffect
useEffect(() => {
    const analysis = analyzeQueryComplexity(search);

    console.log(`🎯 Query Analysis:`, analysis);

    if (analysis.method === 'elasticsearch') {
        dispatch(searchProductsES({ query: search, page, limit }));
    } else {
        dispatch(fetchProducts({ search, page, limit }));
    }
}, [search, page, limit]);
```

**Benefits:**
- ✅ Smarter decisions based on query type
- ✅ Handles exact matches vs fuzzy
- ✅ Detects wildcards and special operators
- ✅ Better user experience for different search types

**Example Behaviors:**
```
"laptop"         → Database (exact match in quotes)
laptop*          → Elasticsearch (wildcard)
gaming laptop    → Elasticsearch (multi-word)
lap              → Database (short query)
ASUS ROG laptop  → Elasticsearch (long multi-word)
```

---

### 2. 🔄 Fallback with Retry Mechanism

Auto-fallback jika satu method gagal.

```typescript
// Fallback mechanism
const hybridFetchWithFallback = async () => {
    const shouldUseES = search && search.trim().length > 2;

    if (shouldUseES) {
        try {
            console.log('🔍 Trying Elasticsearch...');
            const result = await dispatch(searchProductsES({
                query: search, page, limit
            })).unwrap();

            console.log('✅ Elasticsearch success');
            return result;

        } catch (error) {
            console.warn('⚠️ Elasticsearch failed, falling back to Database', error);

            // Fallback to Database
            const result = await dispatch(fetchProducts({
                search, page, limit
            })).unwrap();

            console.log('✅ Database fallback success');
            return result;
        }
    } else {
        return await dispatch(fetchProducts({ search, page, limit })).unwrap();
    }
};

// Usage in useEffect
useEffect(() => {
    hybridFetchWithFallback();
}, [search, page, limit]);
```

**Benefits:**
- ✅ Resilient - app tetap jalan jika ES down
- ✅ Automatic recovery
- ✅ Better reliability
- ✅ User tidak notice failures

**Trade-offs:**
- ❌ Slower on ES failures (retry time)
- ❌ More complex error handling

---

### 3. 📊 Performance-Based Auto-Switching

Monitor performance dan adjust strategy.

```typescript
// Performance tracking
const performanceMetrics = {
    elasticsearch: { totalTime: 0, count: 0, failures: 0 },
    database: { totalTime: 0, count: 0, failures: 0 }
};

const shouldUseElasticsearch = () => {
    if (!search || search.trim().length < 2) return false;

    // Calculate average response times
    const esAvg = performanceMetrics.elasticsearch.count > 0
        ? performanceMetrics.elasticsearch.totalTime / performanceMetrics.elasticsearch.count
        : 100;

    const dbAvg = performanceMetrics.database.count > 0
        ? performanceMetrics.database.totalTime / performanceMetrics.database.count
        : 100;

    // Calculate failure rates
    const esFailureRate = performanceMetrics.elasticsearch.count > 0
        ? performanceMetrics.elasticsearch.failures / performanceMetrics.elasticsearch.count
        : 0;

    // If ES has high failure rate (>20%), prefer Database
    if (esFailureRate > 0.2) {
        console.log('⚠️ ES failure rate high, using Database');
        return false;
    }

    // If ES is significantly slower than DB for current query type, use DB
    if (esAvg > dbAvg * 2) {
        console.log('⚠️ ES slower than DB, using Database');
        return false;
    }

    // Default: use ES for search
    return search.trim().length > 2;
};

// Track performance
const trackPerformance = (method: 'elasticsearch' | 'database', time: number, success: boolean) => {
    performanceMetrics[method].totalTime += time;
    performanceMetrics[method].count += 1;
    if (!success) {
        performanceMetrics[method].failures += 1;
    }
};

// Usage
useEffect(() => {
    const startTime = Date.now();
    const useES = shouldUseElasticsearch();

    const fetchData = async () => {
        try {
            if (useES) {
                await dispatch(searchProductsES({ query: search, page, limit })).unwrap();
                trackPerformance('elasticsearch', Date.now() - startTime, true);
            } else {
                await dispatch(fetchProducts({ search, page, limit })).unwrap();
                trackPerformance('database', Date.now() - startTime, true);
            }
        } catch (error) {
            trackPerformance(useES ? 'elasticsearch' : 'database', Date.now() - startTime, false);
        }
    };

    fetchData();
}, [search, page, limit]);
```

**Benefits:**
- ✅ Self-optimizing based on actual performance
- ✅ Adapts to system conditions
- ✅ Learns from failures
- ✅ Can detect and avoid slow methods

**Trade-offs:**
- ❌ Complex implementation
- ❌ Need to persist metrics (localStorage)
- ❌ May need tuning period

---

### 4. 🎯 Query Intent Detection

Deteksi intent user untuk routing yang lebih smart.

```typescript
// Query intent detection
const detectQueryIntent = (query: string) => {
    const trimmed = query.trim().toLowerCase();

    // SKU search (exact format: ABC-123)
    if (/^[a-z0-9]+-[a-z0-9]+$/i.test(trimmed)) {
        return {
            intent: 'sku_search',
            method: 'database',
            reason: 'SKU are indexed in DB'
        };
    }

    // Price search (contains "$" or "rp")
    if (/\$|rp|\d+k/i.test(trimmed)) {
        return {
            intent: 'price_search',
            method: 'elasticsearch',
            reason: 'Range queries better in ES'
        };
    }

    // Brand search (starts with known brands)
    const brands = ['asus', 'dell', 'hp', 'lenovo', 'acer', 'apple'];
    if (brands.some(brand => trimmed.startsWith(brand))) {
        return {
            intent: 'brand_search',
            method: 'database',
            reason: 'Brand filtering in DB'
        };
    }

    // Descriptive search (multiple adjectives)
    const adjectives = ['gaming', 'professional', 'lightweight', 'portable', 'powerful'];
    const adjectiveCount = adjectives.filter(adj => trimmed.includes(adj)).length;
    if (adjectiveCount >= 2) {
        return {
            intent: 'descriptive_search',
            method: 'elasticsearch',
            reason: 'Multi-word relevance better in ES'
        };
    }

    // Default: analyze by length
    if (trimmed.length > 2) {
        return {
            intent: 'general_search',
            method: 'elasticsearch',
            reason: 'General full-text search'
        };
    }

    return {
        intent: 'browse',
        method: 'database',
        reason: 'Listing/browsing mode'
    };
};

// Usage
useEffect(() => {
    const intent = detectQueryIntent(search);
    console.log('🎯 Detected Intent:', intent);

    if (intent.method === 'elasticsearch') {
        dispatch(searchProductsES({ query: search, page, limit }));
    } else {
        dispatch(fetchProducts({ search, page, limit }));
    }
}, [search, page, limit]);
```

**Benefits:**
- ✅ Highly intelligent routing
- ✅ Optimized for specific use cases
- ✅ Better user experience per intent
- ✅ Can be extended with ML

**Examples:**
```
"LAP-001"              → Database (SKU search)
"laptop under 10jt"    → Elasticsearch (price search)
"asus gaming laptop"   → Database (brand filter)
"lightweight portable" → Elasticsearch (descriptive)
"gaming professional"  → Elasticsearch (multi-adjective)
```

---

### 5. 💾 Hybrid with Caching

Cache ES results untuk mengurangi load.

```typescript
// Cache layer
const searchCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedResults = (key: string) => {
    const cached = searchCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
        searchCache.delete(key);
        return null;
    }

    return cached.data;
};

const setCachedResults = (key: string, data: any) => {
    searchCache.set(key, { data, timestamp: Date.now() });
};

// Usage
useEffect(() => {
    const cacheKey = `search:${search}:${page}:${limit}`;

    // Check cache first
    const cached = getCachedResults(cacheKey);
    if (cached) {
        console.log('💾 Using cached results');
        dispatch(setProducts(cached));
        return;
    }

    // Fetch from ES or DB
    const shouldUseES = search && search.trim().length > 2;

    const fetchData = async () => {
        if (shouldUseES) {
            const result = await dispatch(searchProductsES({
                query: search, page, limit
            })).unwrap();
            setCachedResults(cacheKey, result);
        } else {
            const result = await dispatch(fetchProducts({
                search, page, limit
            })).unwrap();
            // Don't cache DB results (they change frequently)
        }
    };

    fetchData();
}, [search, page, limit]);
```

**Benefits:**
- ✅ Faster repeat searches
- ✅ Reduced ES load
- ✅ Better performance for common queries
- ✅ Cost savings

**Trade-offs:**
- ❌ Stale data risk
- ❌ Memory usage
- ❌ Cache invalidation complexity

---

### 6. 🔀 Progressive Enhancement

Start dengan DB, upgrade ke ES jika perlu.

```typescript
// Progressive enhancement
const [searchMethod, setSearchMethod] = useState<'database' | 'elasticsearch'>('database');

useEffect(() => {
    // Always start with Database for instant results
    dispatch(fetchProducts({ search, page, limit }));
    setSearchMethod('database');

    // If search query is complex, upgrade to ES after initial results
    if (search && search.trim().length > 2) {
        const upgradeTimer = setTimeout(() => {
            console.log('⬆️ Upgrading to Elasticsearch for better results');
            dispatch(searchProductsES({ query: search, page, limit }));
            setSearchMethod('elasticsearch');
        }, 300); // Wait 300ms before upgrading

        return () => clearTimeout(upgradeTimer);
    }
}, [search, page, limit]);
```

**Benefits:**
- ✅ Instant initial results (DB is fast for simple queries)
- ✅ Upgrades to better results automatically
- ✅ Best user experience (no waiting)
- ✅ Progressive enhancement philosophy

**Trade-offs:**
- ❌ Two queries per search (increased load)
- ❌ UI might "flash" when results update
- ❌ More complex state management

---

### 7. 🧪 A/B Testing Ready

Randomly test kedua method untuk comparison.

```typescript
// A/B Testing
const [testGroup, setTestGroup] = useState<'A' | 'B'>('A');

useEffect(() => {
    // Randomly assign user to test group (50/50 split)
    const group = Math.random() > 0.5 ? 'A' : 'B';
    setTestGroup(group);

    const shouldUseES = search && search.trim().length > 2;

    // Group A: Current logic
    // Group B: Always use Elasticsearch
    const useES = testGroup === 'A'
        ? shouldUseES
        : (search && search.trim().length > 0); // More aggressive ES usage

    console.log(`🧪 Test Group: ${testGroup}, Method: ${useES ? 'ES' : 'DB'}`);

    // Track analytics
    if (useES) {
        dispatch(searchProductsES({ query: search, page, limit }));
    } else {
        dispatch(fetchProducts({ search, page, limit }));
    }

    // Send analytics
    trackEvent('search_method_used', {
        testGroup: testGroup,
        method: useES ? 'elasticsearch' : 'database',
        query: search,
        queryLength: search.length
    });

}, [search, page, limit, testGroup]);
```

**Benefits:**
- ✅ Data-driven decisions
- ✅ Can compare actual user behavior
- ✅ Helps optimize threshold
- ✅ Scientific approach

**Trade-offs:**
- ❌ Inconsistent behavior for users
- ❌ Need analytics infrastructure
- ❌ Takes time to collect data

---

## 📊 Comparison Matrix

| Approach | Complexity | Intelligence | Reliability | Performance | Recommended For |
|----------|-----------|--------------|-------------|-------------|-----------------|
| **Current (Length)** | ⭐ Low | ⭐⭐ Basic | ⭐⭐⭐ Good | ⭐⭐⭐ Good | Small apps, simple use cases |
| **Query Complexity** | ⭐⭐ Medium | ⭐⭐⭐⭐ High | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent | **Most apps (RECOMMENDED)** |
| **Fallback Retry** | ⭐⭐ Medium | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Fair | Mission-critical apps |
| **Performance-Based** | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Very High | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐⭐ Excellent | High-traffic apps |
| **Intent Detection** | ⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Very High | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent | E-commerce, complex search |
| **With Caching** | ⭐⭐⭐ High | ⭐⭐ Basic | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | High-traffic, repeat queries |
| **Progressive** | ⭐⭐⭐ High | ⭐⭐⭐ Good | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | Speed-critical apps |
| **A/B Testing** | ⭐⭐⭐ High | ⭐⭐ Basic | ⭐⭐⭐ Good | ⭐⭐⭐ Good | Optimization phase |

---

## 🎯 My Recommendation

### For Your Use Case:

**Upgrade to: Query Complexity Analysis + Fallback**

```typescript
// Recommended implementation
const analyzeAndFetch = async () => {
    const analysis = analyzeQueryComplexity(search);

    console.log(`🎯 Query Analysis:`, analysis);

    try {
        if (analysis.method === 'elasticsearch') {
            await dispatch(searchProductsES({
                query: search, page, limit
            })).unwrap();
        } else {
            await dispatch(fetchProducts({
                search, page, limit
            })).unwrap();
        }
    } catch (error) {
        // Fallback
        console.warn('⚠️ Primary method failed, trying fallback');
        if (analysis.method === 'elasticsearch') {
            await dispatch(fetchProducts({ search, page, limit })).unwrap();
        }
    }
};
```

**Why:**
- ✅ Significant improvement over current
- ✅ Not too complex
- ✅ Better user experience
- ✅ More reliable
- ✅ Easy to maintain

**Later (Phase 2):**
- Add caching for popular queries
- Add performance tracking
- Consider intent detection for specific use cases

---

## 🚀 Implementation Priority

### Phase 1 (Now): Query Complexity Analysis
- Most bang for buck
- Easy to implement
- Clear benefits

### Phase 2 (1-2 weeks): Add Fallback
- Improve reliability
- Better error handling
- Seamless user experience

### Phase 3 (1 month): Add Caching
- Improve performance
- Reduce server load
- Cost optimization

### Phase 4 (Future): Performance Tracking
- Self-optimizing system
- Data-driven decisions
- Continuous improvement

---

**Current Implementation: Good** ✅
**Recommended Upgrade: Query Complexity + Fallback** 🚀
**Future: Performance-Based + Caching** 🎯

