import React, { useState } from 'react';

const ArticleGenerator = () => {
  const [hotelData, setHotelData] = useState({
    hotel_name: '',
    description: '',
    rating: 1,
    reviews: [''],
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHotelData(prevData => ({
      ...prevData,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleReviewChange = (e, index) => {
    const newReviews = [...hotelData.reviews];
    newReviews[index] = e.target.value;
    setHotelData(prevData => ({
      ...prevData,
      reviews: newReviews
    }));
  };

  const handleAddReview = () => {
    setHotelData(prevData => ({
      ...prevData,
      reviews: [...prevData.reviews, '']
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result.split(',')[1]); // base64
        setPhotoPreview(reader.result)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/generate-travel-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...hotelData,
          photo: photo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedArticle(data.article);
    } catch (err) {
      setError('Failed to generate article: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Travel Article Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md ">
          <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Hotel Name:</label>
              <input
                type="text"
                name="hotel_name"
                value={hotelData.hotel_name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description:</label>
              <textarea
                name="description"
                value={hotelData.description}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                rows={8}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Rating:(1-5)</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                step="0.1"
                value={hotelData.rating}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Reviews:</label>
              {hotelData.reviews.map((review, index) => (
                <input
                  key={index}
                  type="text"
                  value={review}
                  onChange={(e) => handleReviewChange(e, index)}
                  className="w-full p-2 border rounded mb-2"
                />
              ))}
              <button
                type="button"
                onClick={handleAddReview}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Add Review
              </button>
            </div>
            <div>
              <label className="block mb-1 font-medium">Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="w-full p-2 border rounded"
              />
              {photoPreview && (
                <div className="mt-2">
                  <img src={photoPreview} alt="Hotel preview" className="max-w-full h-auto rounded" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-green-600 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Article'
              )}
            </button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-11/12 overflow-y-scroll">
          <h2 className="text-xl font-semibold mb-4">Generated Article</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {generatedArticle ? (
            <div className="prose prose-sm max-w-none">
              {generatedArticle.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Your generated article will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;