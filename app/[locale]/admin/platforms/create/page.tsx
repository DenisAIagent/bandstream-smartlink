"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CreatePlatform() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [shortname, setShortName] = useState('');
    const [URL, setURL] = useState('');
    const [logoFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const sanitizedShortname = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''); // Remove special characters and keep lowercase a-z and 0-9
        setShortName(sanitizedShortname);
        setURL("https://"+sanitizedShortname+".com");
    }, [name]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('shortname', shortname);
        formData.append('URL', URL);
        if (logoFile) formData.append('image', logoFile);

        // Send data to the API
        const response = await fetch('/api/admin/platforms/', {
            cache: 'force-cache',
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            router.push('/admin/platforms'); // Redirect back to admin page on success
        } else {
            console.error('Failed to create platform');
        }

        setLoading(false);
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Add New Streaming Service</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Short Name</label>
                    <input
                        type="text"
                        value={shortname}
                        onChange={(e) => setShortName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">URL</label>
                    <input
                        type="text"
                        value={URL}
                        onChange={(e) => setURL(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-2">Upload PNG Logo</label>
                    <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Uploading...' : 'Create Streaming Service'}
                </button>
            </form>
        </div>
    );
}