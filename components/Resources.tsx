import React, { useState, useRef, useCallback } from 'react';
import type { Resource } from '../types';

const Resources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddResource = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && url.trim()) {
            const newResource: Resource = { id: Date.now().toString(), title, url };
            const updatedResources = [...resources, newResource];
            setResources(updatedResources);
            setTitle('');
            setUrl('');
        }
    };

    const handleDeleteResource = (id: string) => {
        const updatedResources = resources.filter(r => r.id !== id);
        setResources(updatedResources);
    };

    const handleExport = () => {
        if (resources.length === 0) {
            alert("There are no resources to export.");
            return;
        }
        const dataStr = JSON.stringify(resources, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ib-cs-resources.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not valid text");
                const importedResources = JSON.parse(text);
                // Basic validation
                if (Array.isArray(importedResources) && importedResources.every(r => r.id && r.title && r.url)) {
                    setResources(importedResources);
                } else {
                    alert('Invalid file format. Please import a valid JSON file exported from this tool.');
                }
            } catch (error) {
                console.error("Failed to import resources:", error);
                alert('Failed to read or parse the file. Please ensure it is a valid JSON file.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };


    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="text-center sm:text-left">
                        <h2 className="text-5xl font-bold">Teacher Resources</h2>
                        <p className="text-xl text-gray-400 mt-2">Add, manage, and share links to useful web resources.</p>
                    </div>
                    <div className="flex gap-3">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button onClick={handleImportClick} className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-lg">
                            Import
                        </button>
                        <button onClick={handleExport} className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors text-lg">
                            Export
                        </button>
                    </div>
                </div>

                 <p className="text-sm text-amber-300 text-center bg-amber-900/40 p-3 rounded-md border border-amber-700">
                    <strong>Note:</strong> Resources are managed per session. Use <strong>Export</strong> to save your list to a file, and <strong>Import</strong> to load it on another computer or in a future session.
                </p>

                <form onSubmit={handleAddResource} className="mt-8 flex flex-col md:flex-row gap-4 items-center">
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Resource Title" 
                        required
                        className="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md px-5 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-xl"
                    />
                    <input 
                        type="url" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                        placeholder="https://example.com" 
                        required
                        className="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md px-5 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-xl"
                    />
                    <button 
                        type="submit" 
                        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform text-xl"
                    >
                        Add
                    </button>
                </form>
            </div>

            <div className="mt-8">
                {resources.length > 0 ? (
                    <div className="space-y-3">
                        {resources.map(resource => (
                            <div key={resource.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                <div>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-2xl text-cyan-400 hover:underline">
                                        {resource.title}
                                    </a>
                                    <p className="text-base text-gray-500 mt-1">{resource.url}</p>
                                </div>
                                <button onClick={() => handleDeleteResource(resource.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-16 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-lg">No resources have been added yet.</p>
                        <p className="text-base">Use the form above to add your first resource, or import an existing list.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resources;