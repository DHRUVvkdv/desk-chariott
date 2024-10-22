import React, { useState, useEffect } from 'react';

export const DocumentManagementDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    import('react-pdf').then(reactPdf => {
      reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${reactPdf.pdfjs.version}/pdf.worker.min.js`;
    });
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/documents/documents', {
        headers: {
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        throw new Error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      alert('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file.');
      event.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('chain_id', 'courtyard');
      formData.append('hotel_id', 'blacksburg');

      try {
        const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/documents/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          },
        });

        if (response.ok) {
          await fetchDocuments(); // Refresh the document list
          setSelectedFile(null);
          document.getElementById('file-upload').value = '';
          alert('Document uploaded successfully!');
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDownload = (document) => {
    window.open(document.s3_url, '_blank');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Document Management</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload New Document</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="file-upload"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`px-4 py-2 rounded-md text-white font-semibold
                ${selectedFile && !isUploading
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: {selectedFile.name}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Uploaded Documents</h2>
          {isLoading ? (
            <p>Loading documents...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-sm text-gray-900">{doc.file_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{doc.status}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{doc.user_id}</td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};