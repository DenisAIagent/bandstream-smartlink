"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

interface Platform {
    id: number;
    name: string;
    shortname: string;
    logo: string;
    URL: string;
}

export default function EditPlatform() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [platform, setPlatform] = useState<Platform | null>(null);
    const [name, setName] = useState('');
    const [shortname, setShortName] = useState('');
    const [URL, setURL] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchPlatform() {
            if (!id) return; // Wait until `id` is available
            const response = await fetch(`/api/admin/platforms/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPlatform(data);
                setName(data.name);
                setShortName(data.shortname);
                setURL(data.URL);
            } else {
                console.error('Failed to fetch platform data');
            }
        }
        fetchPlatform();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('shortname', shortname);
        formData.append('URL', URL);
        if (imageFile) formData.append('image', imageFile);

        // Send data to the API
        const response = await fetch(`/api/admin/platforms/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            router.push('/admin/platforms');
        } else {
            console.error('Failed to update platform');
        }

        setLoading(false);
    }

    if (!platform) {
        return <p>Loading...</p>;
    }

    return (
        <div className="p-8 max-w-full mx-auto">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Edit Platform: {name}</CardTitle>
                    {platform.logo && (
                        <Image
                            src={platform.logo}
                            alt={`${platform.name} logo`}
                            width={90}
                            height={0}
                            className="w-32 h-auto rounded"
                        />
                    )}
                    <CardDescription>
                        Update your platform&apos;s information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label>Shortname</Label>
                            <Input
                                type="text"
                                value={shortname}
                                onChange={(e) => setShortName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label>URL</Label>
                            <Input
                                type="text"
                                value={URL}
                                onChange={(e) => setURL(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label>Upload New PNG Logo</Label>
                            <Input
                                type="file"
                                accept="image/png"
                                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Platform'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}