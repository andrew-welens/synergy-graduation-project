import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi } from '../services/clients'
import { ordersApi } from '../services/orders'
import { type Client, type Order } from '../services/types'
import { useDebounce } from '../hooks/use-debounce'
import { useAuth } from '../utils/auth'

interface SearchResult {
  type: 'client' | 'order'
  id: string
  title: string
  subtitle?: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  const { role } = useAuth()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (inputRef.current) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const canReadClients = role === 'admin' || role === 'manager' || role === 'operator' || role === 'analyst'
  const canReadOrders = role === 'admin' || role === 'manager' || role === 'operator' || role === 'analyst'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    const queryLower = debouncedQuery.toLowerCase()
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(debouncedQuery.trim())
    
    const clientsPromise = canReadClients 
      ? clientsApi.list({ page: 1, pageSize: 5, search: debouncedQuery })
      : Promise.resolve({ data: [], total: 0 })
    
    const ordersPromise = canReadOrders
      ? (isUUID 
          ? ordersApi.get(debouncedQuery.trim())
              .then((order) => ({ data: [order], total: 1 }))
              .catch(() => ({ data: [], total: 0 }))
          : ordersApi.list({ page: 1, pageSize: 50 })
              .then((res) => ({
                data: res.data.filter((order: Order) => 
                  order.id.toLowerCase().includes(queryLower) ||
                  order.clientName?.toLowerCase().includes(queryLower)
                ),
                total: res.total
              }))
        )
      : Promise.resolve({ data: [], total: 0 })

    Promise.all([clientsPromise, ordersPromise])
      .then(([clientsRes, ordersRes]) => {
        const searchResults: SearchResult[] = []
        
        if (canReadClients) {
          clientsRes.data.forEach((client: Client) => {
            searchResults.push({
              type: 'client',
              id: client.id,
              title: client.name,
              subtitle: client.email || client.phone || undefined
            })
          })
        }

        if (canReadOrders) {
          ordersRes.data.forEach((order: Order) => {
            searchResults.push({
              type: 'order',
              id: order.id,
              title: `Заказ ${order.id}`,
              subtitle: order.clientName || undefined
            })
          })
        }

        setResults(searchResults.slice(0, 8))
        setIsOpen(searchResults.length > 0)
      })
      .catch(() => {
        setResults([])
        setIsOpen(false)
      })
      .finally(() => setIsLoading(false))
  }, [debouncedQuery, canReadClients, canReadOrders])

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'client') {
      navigate(`/clients/${result.id}`)
    } else {
      navigate(`/orders/${result.id}`)
    }
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current && searchRef.current) {
          const inputRect = inputRef.current.getBoundingClientRect()
          const resultsEl = searchRef.current.querySelector('.global-search-results') as HTMLElement
          if (resultsEl) {
            resultsEl.style.top = `${inputRect.bottom + 8}px`
            resultsEl.style.left = `${inputRect.left}px`
          }
        }
      }
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        className="input"
        placeholder="Поиск клиентов и заказов (/)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value.trim().length >= 2) {
            setIsOpen(true)
          }
        }}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true)
          }
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (isLoading || results.length > 0) && (
        <div className="global-search-results">
          {isLoading ? (
            <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Поиск...</div>
          ) : results.length > 0 ? (
            <>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="global-search-result"
                  type="button"
                  onClick={() => handleResultClick(result)}
                >
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.title}</div>
                  {result.subtitle && <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.subtitle}</div>}
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {result.type === 'client' ? 'Клиент' : 'Заказ'}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  )
}
