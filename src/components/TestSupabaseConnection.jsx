
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function TestSupabaseConnection() {
    const [products, setProducts] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getProducts() {
            try {
                const { data, error } = await supabase.from('products').select('*')

                if (error) throw error

                setProducts(data || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        getProducts()
    }, [])

    if (loading) return <div>Checking connection...</div>
    if (error) return <div style={{ color: 'red' }}>Connection Error: {error}</div>

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>Supabase Connection Test</h3>
            <p>Status: <span style={{ color: 'green', fontWeight: 'bold' }}>Connected</span></p>
            <p>Products found: {products.length}</p>
            <ul>
                {products.slice(0, 3).map((product) => (
                    <li key={product.id}>{product.title} - ${product.price}</li>
                ))}
            </ul>
        </div>
    )
}

export default TestSupabaseConnection
