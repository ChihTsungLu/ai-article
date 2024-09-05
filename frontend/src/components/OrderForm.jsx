import React, { useState } from 'react';

export default function OrderForm() {
    const [orderData, setOrderData] = useState({
        id: '',
        name: '',
        address: {
            city: '',
            district: '',
            street: ''
        },
        price: '',
        currency: ''
    });

    const [response, setResponse] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setOrderData(prevState => ({
                ...prevState,
                [parent]: {
                    ...prevState[parent],
                    [child]: value
                }
            }));
        } else {
            setOrderData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
            const data = await res.json();
            if (res.ok) {
                setResponse(data);
            } else {
                setResponse({ error: data.detail });
            }
        } catch (error) {
            setResponse({ error: 'An error occurred while submitting the order.' });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Order Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    name="id" 
                    value={orderData.id} 
                    onChange={handleChange} 
                    placeholder="ID" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="name" 
                    value={orderData.name} 
                    onChange={handleChange} 
                    placeholder="Name" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="address.city" 
                    value={orderData.address.city} 
                    onChange={handleChange} 
                    placeholder="City" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="address.district" 
                    value={orderData.address.district} 
                    onChange={handleChange} 
                    placeholder="District" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="address.street" 
                    value={orderData.address.street} 
                    onChange={handleChange} 
                    placeholder="Street" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="price" 
                    value={orderData.price} 
                    onChange={handleChange} 
                    placeholder="Price" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    name="currency" 
                    value={orderData.currency} 
                    onChange={handleChange} 
                    placeholder="Currency" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                >
                    Submit Order
                </button>
            </form>
            {response && (
                <div className="mt-6 p-4 bg-gray-100 rounded-md">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Response:</h2>
                    <pre className="bg-white p-2 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}