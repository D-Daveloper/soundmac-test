'use client'
import { useContext, useState } from 'react';
import UserRoute from "@/app/protectedRoute/protectedRoute";
import classes from './create-artist.module.css'
import Loader from '@/app/components/Loader/loader';
import UserContext from '@/app/context/userContext/userContext';
import { SELECTED_IMAGE } from '../types';
import axios from 'axios';
import InformationContext from '@/app/context/informationContext/informationContext';
import { useRouter } from 'next/navigation';
import { USER_PORTAL_NAVIGATION_LINKS } from '@/app/utils/constants';

const url = process.env.NEXT_PUBLIC_APP_URL_VERSION_2
export default function CreateArtist() {
    const userContext = useContext(UserContext)
    const informationContext = useContext(InformationContext)

    const router = useRouter()

    const [selectedImage, setSelectedImage] = useState<SELECTED_IMAGE>(null);
    const [artistImageFile, setArtistImageFile] = useState<File | null>(null); // Changed to store File directly
    const [artistName, setArtistName] = useState('');
    const [creating, setCreating] = useState(false)

    const buttonDisabled = artistName.trim().length < 3 || !selectedImage

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArtistImageFile(file); // Store the File object directly
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const formData = new FormData();
            formData.append('artistName', artistName);

            if (artistImageFile) {
                formData.append('artistImage', artistImageFile); // Use the stored File object
            } else {
                console.error('No image file selected');
                informationContext?.addToast('error', 'Error!', 'Please select an image');
                return;
            }

            const token = localStorage.getItem("token")
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            }

            const { data } = await axios.post(`${url}/artists`, formData, config);
            informationContext?.addToast('success', 'Success!', data.message);
            setSelectedImage(null)
            setArtistImageFile(null)
            setArtistName('')
            router.push(USER_PORTAL_NAVIGATION_LINKS.Artists[1]?.link)
        } catch (error) {
            userContext?.handleAPIError(error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <UserRoute>
            <div className={classes.container}>
                <form onSubmit={handleSubmit} className={classes.form}>
                    {/* Image Upload Section */}
                    <div className={classes.imageSection}>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={classes.hiddenInput}
                        />

                        <label htmlFor="imageUpload" className={classes.imagePreview}>
                            {selectedImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={String(selectedImage)}
                                    alt="Artist preview"
                                    className={classes.previewImage}
                                />
                            ) : (
                                <div className={classes.placeholder}>
                                    <svg
                                        className={classes.placeholderIcon}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p className={classes.placeholderText}>Click to upload image</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Artist Name Input */}
                    <input
                        type="text"
                        id="artistName"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        placeholder="Enter artist name"
                        className={classes.textInput}
                        required
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={classes.submitBtn}
                        disabled={buttonDisabled || creating}
                    >
                        Create Artist {creating && <Loader color={'white'} />}
                    </button>
                </form>
            </div>
        </UserRoute>
    )
}