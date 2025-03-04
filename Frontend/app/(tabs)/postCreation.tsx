import { Text, View, ScrollView, ActivityIndicator, TextInput, TouchableHighlight, Button, Image, Alert } from 'react-native'

import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from 'axios';
import { useAuthCheck } from '../../store/checkLogin';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = "http://10.0.2.2:5000/api/uploadmultiple";
const API_URL_UPLOAD_VIDEO = "http://10.0.2.2:5000/api/uploadvideo";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

// Định nghĩa kiểu cho ảnh và video

interface Media {
    uri: string;
}

interface Category {
    _id: string;
    categoryName: string;
}

interface Brand {
    _id: string;
    brandName: string;
    categoryId: string;
}

interface Ram {
    _id: string;
    ramCapacity: string;
}

interface Cpu {
    _id: string;
    cpuName: string;
}

interface Gpu {
    _id: string;
    gpuName: string;
}

interface Screen {
    _id: string;
    screenSize: string;
}

interface Storage {
    _id: string;
    storageCapacity: string;
    storageTypeId: StorageType | string; // Có thể là object hoặc string ID
}

interface StorageType {
    _id: string;
    storageName: string;
}

interface Version {
    _id: string;
    versionName: string;
    brandId: {
        _id: string;
        brandName: string;
    };
}

interface ApiResponse<T> {
    data: {
        data: T[];
    }
}

// Thêm interfaces cho địa chỉ từ API
interface Province {
    code: string;
    name: string;
    division_type: string;
    codename: string;
    phone_code: number;
}

interface District {
    code: string;
    name: string;
    division_type: string;
    codename: string;
    province_code: string;
}

// Thêm interface cho Condition
interface Condition {
    _id: string;
    condition: string;
}

// Thêm interface cho options xuất xứ
interface OriginOption {
    label: string;
    value: string;
}

// Thêm import useSelector

export default function PostCreation() {
    const params = useLocalSearchParams();
    const id = params.id;
    console.log("ID từ params:", id, typeof id);
    
    const isEditMode = typeof id === 'string' && id.length > 0;
    console.log("isEditMode:", isEditMode);
    
    const router = useRouter();
    
    // Lấy user từ Redux store
    const { user } = useSelector((state: RootState) => state.auth);
    const [avatarUrls, setAvatarUrls] = useState<string[]>([]);
    const [video, setVideo] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [videoloading, setVideoLoading] = useState(false);
    // States cho các trường select
    const checkAuth = useAuthCheck();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCpu, setSelectedCpu] = useState("");
    const [selectedGpu, setSelectedGpu] = useState("");
    const [selectedRam, setSelectedRam] = useState("");
    const [selectedScreen, setSelectedScreen] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");
    const [selectedStorageType, setSelectedStorageType] = useState("");
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedWarranty, setSelectedWarranty] = useState("3 tháng");
    const [selectedOrigin, setSelectedOrigin] = useState("Việt Nam");
    const [selectedPostType, setSelectedPostType] = useState("Đăng tin thường");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedVersion, setSelectedVersion] = useState("");

    // States cho các trường input
    const [price, setPrice] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [battery, setBattery] = useState<string>('');

    // States cho media
    const [images, setImages] = useState<string[]>([]);
    const [videos, setVideos] = useState<Media[]>([]);

    // States cho data từ API
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [cpus, setCpus] = useState<Cpu[]>([]);
    const [gpus, setGpus] = useState<Gpu[]>([]);
    const [rams, setRams] = useState<Ram[]>([]);
    const [screens, setScreens] = useState<Screen[]>([]);
    const [storages, setStorages] = useState<Storage[]>([]);
    const [storageTypes, setStorageTypes] = useState<StorageType[]>([]);
    const [versions, setVersions] = useState<Version[]>([]);

    // States cho địa chỉ
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    // Các options cố định
    const warrantyOptions = [
        { label: "3 tháng", value: "3 tháng" },
        { label: "6 tháng", value: "6 tháng" },
        { label: "12 tháng", value: "12 tháng" }
    ];

    // Thêm mảng các options xuất xứ
    const originOptions: OriginOption[] = [
        { label: "Chọn xuất xứ", value: "" },
        { label: "Chính hãng", value: "Chính hãng" },
        { label: "Xách tay", value: "Xách tay" },
        { label: "Nhập khẩu", value: "Nhập khẩu" }
    ];

    const postTypeOptions = [
        { label: "Đăng tin thường", value: "Đăng tin thường" },
        { label: "Đăng tin trả phí", value: "Đăng tin trả phí" }
    ];

    // Thêm useEffect để fetch conditions
    useEffect(() => {
        const fetchConditions = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:5000/api/conditions');
                setConditions(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách tình trạng:', error);
            }
        };
        fetchConditions();
    }, []);

    // Fetch data từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesResponse = await axios.get<ApiResponse<Category>>('http://10.0.2.2:5000/api/categories');
                setCategories(categoriesResponse.data.data);

                const brandsResponse = await axios.get<ApiResponse<Brand>>('http://10.0.2.2:5000/api/brands');
                setBrands(brandsResponse.data.data);

                const ramsResponse = await axios.get<ApiResponse<Ram>>('http://10.0.2.2:5000/api/rams');
                setRams(ramsResponse.data.data);

                const screensResponse = await axios.get<ApiResponse<Screen>>('http://10.0.2.2:5000/api/screens');
                setScreens(screensResponse.data.data);

            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            }
        };

        fetchData();
    }, []);

    // Fetch storage và storageTypes khi component mount
    useEffect(() => {
        const fetchStorageData = async () => {
            try {
                const [storagesResponse, storageTypesResponse] = await Promise.all([
                    axios.get('http://10.0.2.2:5000/api/storages'),
                    axios.get('http://10.0.2.2:5000/api/storage-types')
                ]);

                setStorages(storagesResponse.data.data);
                setStorageTypes(storageTypesResponse.data.data);
                console.log('Storages:', storagesResponse.data.data);
                console.log('Storage Types:', storageTypesResponse.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu storage:', error);
            }
        };

        fetchStorageData();
    }, []);

    // Lọc brands theo category
    const filteredBrands = brands.filter(brand =>
        brand.categoryId === selectedCategory
    );

    // Kiểm tra xem có phải category laptop không
    const isLaptopCategory = useMemo(() => {
        return selectedCategory && categories.find(cat =>
            cat._id === selectedCategory &&
            cat.categoryName.toLowerCase() === 'laptop'
        );
    }, [selectedCategory, categories]);

    // Lọc storages dựa trên điều kiện
    const filteredStorages = useMemo(() => {
        if (!selectedCategory) return [];

        if (isLaptopCategory) {
            // Nếu là laptop, lọc theo storageType đã chọn
            return storages.filter(storage => {
                const storageTypeId = typeof storage.storageTypeId === 'object'
                    ? storage.storageTypeId._id
                    : storage.storageTypeId;
                return storageTypeId === selectedStorageType;
            });
        } else {
            // Nếu là điện thoại, chỉ hiển thị storage không có storageType
            return storages.filter(storage => !storage.storageTypeId);
        }
    }, [isLaptopCategory, storages, selectedStorageType, selectedCategory]);

    // Lọc versions theo brand đã chọn
    const filteredVersions = useMemo(() => {
        return versions.filter(version =>
            version.brandId?._id === selectedBrand
        );
    }, [versions, selectedBrand]);

    // Fetch provinces khi component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách tỉnh/thành:', error);
            }
        };

        fetchProvinces();
    }, []);

    // Cập nhật hàm fetch districts và thêm hàm fetch wards
    const handleProvinceChange = async (provinceCode: string) => {
        setSelectedProvince(provinceCode);
        setSelectedDistrict(""); // Reset district
        setSelectedWard(""); // Reset ward
        setDetailAddress(""); // Reset detail address

        if (provinceCode) {
            try {
                const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                setDistricts(response.data.districts);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách quận/huyện:', error);
                setDistricts([]);
            }
        } else {
            setDistricts([]);
            setWards([]);
        }
    };

    const handleDistrictChange = async (districtCode: string) => {
        setSelectedDistrict(districtCode);
        setSelectedWard(""); // Reset ward
        setDetailAddress(""); // Reset detail address

        if (districtCode) {
            try {
                const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                setWards(response.data.wards);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách phường/xã:', error);
                setWards([]);
            }
        } else {
            setWards([]);
        }
        updateFullAddress();
    };

    const handleWardChange = (wardCode: string) => {
        setSelectedWard(wardCode);
        updateFullAddress();
    };

    const handleDetailAddressChange = (text: string) => {
        setDetailAddress(text);
        updateFullAddress();
    };

    // Hàm cập nhật địa chỉ đầy đủ
    const updateFullAddress = () => {
        const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
        const districtName = districts.find(d => d.code === selectedDistrict)?.name || '';
        const wardName = wards.find(w => w.code === selectedWard)?.name || '';

        let fullAddress = '';

        if (detailAddress) {
            fullAddress += detailAddress;
        }
        if (wardName) {
            fullAddress += fullAddress ? `, ${wardName}` : wardName;
        }
        if (districtName) {
            fullAddress += fullAddress ? `, ${districtName}` : districtName;
        }
        if (provinceName) {
            fullAddress += fullAddress ? `, ${provinceName}` : provinceName;
        }

        setSelectedLocation(fullAddress);
    };

    // Thêm state để theo dõi trạng thái tải dữ liệu
    const [pageLoading, setPageLoading] = useState(false);
    
    // Fetch dữ liệu sản phẩm nếu đang ở chế độ edit
    useEffect(() => {
        if (!id) return; // Nếu không có id, tức là đang ở chế độ tạo mới
        
        const fetchProductData = async () => {
            try {
                setPageLoading(true);
                // Sửa lỗi: Thêm token xác thực và xử lý lỗi chi tiết hơn
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(`http://10.0.2.2:5000/api/products/edit/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                console.log("Dữ liệu sản phẩm nhận được:", response.data);
                const productData = response.data;
                
                // Cập nhật các state với dữ liệu sản phẩm
                setSelectedCategory(productData.categoryId);
                setSelectedBrand(productData.brandId);
                setSelectedVersion(productData.versionId);
                setSelectedCondition(productData.conditionId);
                setSelectedStorage(productData.storageId);
                setSelectedRam(productData.ramId);
                setTitle(productData.title);
                setDescription(productData.description);
                setPrice(productData.price.toString());
                setSelectedWarranty(productData.warranty);
                setSelectedPostType(productData.isVip ? "Đăng tin trả phí" : "Đăng tin thường");
                setAvatarUrls(productData.images || []);
                setVideoUrl(productData.videos || null);
                
                // Cập nhật thông tin chi tiết
                if (productData.cpuId) setSelectedCpu(productData.cpuId);
                if (productData.gpuId) setSelectedGpu(productData.gpuId);
                if (productData.screenId) setSelectedScreen(productData.screenId);
                if (productData.storageTypeId) setSelectedStorageType(productData.storageTypeId);
                if (productData.battery) setBattery(productData.battery);
                if (productData.origin) setSelectedOrigin(productData.origin);
                
                // Cập nhật thông tin địa chỉ
                if (productData.location) {
                    setSelectedProvince(productData.location.provinceCode || "");
                    setSelectedDistrict(productData.location.districtCode || "");
                    setSelectedWard(productData.location.wardCode || "");
                    setDetailAddress(productData.location.detailAddress || "");
                    setSelectedLocation(productData.location.fullAddress || "");
                    
                    // Fetch districts và wards dựa trên province và district đã chọn
                    if (productData.location.provinceCode) {
                        const provinceResponse = await axios.get(`https://provinces.open-api.vn/api/p/${productData.location.provinceCode}?depth=2`);
                        setDistricts(provinceResponse.data.districts);
                        
                        if (productData.location.districtCode) {
                            const districtResponse = await axios.get(`https://provinces.open-api.vn/api/d/${productData.location.districtCode}?depth=2`);
                            setWards(districtResponse.data.wards);
                        }
                    }
                }
                
                // Nếu có video, tạo thumbnail
                if (productData.videos) {
                    try {
                        const { uri } = await VideoThumbnails.getThumbnailAsync(productData.videos, { time: 1000 });
                        setThumbnail(uri);
                    } catch (err) {
                        console.error("Thumbnail generation error:", err);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu sản phẩm:', error.response?.data || error.message);
                Alert.alert('Lỗi', 'Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setPageLoading(false);
            }
        };
        
        fetchProductData();
    }, [id]);

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để đăng tin');
            return;
        }
        
        // Validate các trường bắt buộc
        if (!selectedCategory || !selectedBrand || !selectedCondition ||
            !selectedStorage || !selectedWarranty || !selectedOrigin ||
            !title || !description || !price || !selectedPostType ||
            !selectedRam) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin sản phẩm');
            return;
        }
        
        if (avatarUrls.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ảnh sản phẩm');
            return;
        } else if (avatarUrls.length > 6) {
            Alert.alert('Thông báo', 'Vui lòng chọn tối đa 6 ảnh sản phẩm');
            return;
        }
        
        try {
            const productData = {
                userId: user.id,
                categoryId: selectedCategory,
                versionId: selectedVersion,
                conditionId: selectedCondition,
                storageId: selectedStorage,
                title,
                description,
                price: parseFloat(price),
                isVip: selectedPostType === "Đăng tin trả phí",
                warranty: selectedWarranty,
                videos: videoUrl || '',
                location: {
                    provinceCode: selectedProvince,
                    provinceName: provinces.find(p => p.code === selectedProvince)?.name,
                    districtCode: selectedDistrict,
                    districtName: districts.find(d => d.code === selectedDistrict)?.name,
                    wardCode: selectedWard,
                    wardName: wards.find(w => w.code === selectedWard)?.name,
                    detailAddress: detailAddress,
                    fullAddress: selectedLocation
                },
                images: avatarUrls
            };
            
            // Thêm thông tin chi tiết dựa vào loại sản phẩm
            const category = categories.find(cat => cat._id === selectedCategory);
            if (category?.categoryName.toLowerCase() === 'laptop') {
                productData.cpuId = selectedCpu;
                productData.gpuId = selectedGpu;
                productData.ramId = selectedRam;
                productData.screenId = selectedScreen;
                productData.battery = battery || "0";
                productData.origin = selectedOrigin;
            } else {
                productData.ramId = selectedRam;
                productData.battery = battery || "0";
                productData.origin = selectedOrigin;
            }
            
            let response;
            if (isEditMode) {
                // Gọi API cập nhật sản phẩm
                response = await axios.put(`http://10.0.2.2:5000/api/products/${id}`, productData);
                Alert.alert('Thành công', 'Cập nhật tin thành công', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                // Gọi API tạo sản phẩm mới
                response = await axios.post('http://10.0.2.2:5000/api/products', productData);
                Alert.alert('Thành công', 'Đăng tin thành công', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error('Lỗi khi xử lý tin:', error.response?.data || error.message);
            Alert.alert('Lỗi', `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'đăng'} tin`);
        }
    };

    const handleCategoryChange = async (itemValue: string) => {
        console.log('Selected Category ID:', itemValue);
        setSelectedCategory(itemValue);
        setSelectedBrand("");
        setSelectedVersion(""); // Reset version khi đổi category

        if (itemValue) {
            try {
                // Lấy dữ liệu brands và versions
                const [brandsRes, versionsRes] = await Promise.all([
                    axios.get<ApiResponse<Brand>>(`http://10.0.2.2:5000/api/brands?categoryId=${itemValue}`),
                    axios.get<ApiResponse<Version>>('http://10.0.2.2:5000/api/versions')
                ]);

                console.log('Versions Response:', versionsRes.data); // Debug log

                setBrands(brandsRes.data.data);
                setVersions(versionsRes.data.data);

                // Kiểm tra category là laptop
                const selectedCategoryObj = categories.find(cat => cat._id === itemValue);
                const isLaptopCategory = selectedCategoryObj?.categoryName.toLowerCase() === 'laptop';

                console.log('Is Laptop Category:', isLaptopCategory);

                if (isLaptopCategory) {
                    const [cpusRes, gpusRes, screensRes, storageTypesRes] = await Promise.all([
                        axios.get<ApiResponse<Cpu>>('http://10.0.2.2:5000/api/cpus'),
                        axios.get<ApiResponse<Gpu>>('http://10.0.2.2:5000/api/gpus'),
                        axios.get<ApiResponse<Screen>>('http://10.0.2.2:5000/api/screens'),
                        axios.get<ApiResponse<StorageType>>('http://10.0.2.2:5000/api/storage-types')
                    ]);

                    setCpus(cpusRes.data.data);
                    setGpus(gpusRes.data.data);
                    setScreens(screensRes.data.data);
                    setStorageTypes(storageTypesRes.data.data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setBrands([]);
                setVersions([]);
            }
        } else {
            setBrands([]);
            setVersions([]);
            setCpus([]);
            setGpus([]);
            setScreens([]);
            setStorageTypes([]);
        }
    };

    // Xử lý khi thay đổi loại ổ cứng
    const handleStorageTypeChange = (itemValue: string) => {
        setSelectedStorageType(itemValue);
        setSelectedStorage(""); // Reset selected storage
        console.log('Selected Storage Type:', itemValue);
    };

    // Xử lý khi thay đổi brand
    const handleBrandChange = (itemValue: string) => {
        setSelectedBrand(itemValue);
        setSelectedVersion(""); // Reset version khi đổi brand
        console.log('Selected Brand:', itemValue);
        console.log('Available Versions:', filteredVersions);
    };

    useEffect(() => {
        checkAuth()
    }, [checkAuth]);

    const selectImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImages = result.assets.map(asset => asset.uri);
            setImages(selectedImages);
        }
    };

    const uploadImages = async () => {
        if (images.length === 0) {
            Alert.alert("Vui lòng chọn ảnh trước");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            images.forEach((image, index) => {
                formData.append("images", {
                    uri: image,
                    type: "image/jpeg",
                    name: `image-${index}.jpg`,
                } as any);
            });

            const response = await axios.post(API_URL, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (!response.data.success) {
                let errorMessage = "Upload thất bại:\n";
                
                if (response.data.details) {
                    if (response.data.details.hasInappropriateContent) {
                        const inappropriateFiles = response.data.details.inappropriateFiles || [];
                        errorMessage += "Các ảnh không phù hợp hoặc trùng lặp:\n";
                        inappropriateFiles.forEach((fileName: string) => {
                            errorMessage += `- ${fileName}\n`;
                        });
                    }
                    
                    if (response.data.details.isDuplicate) {
                        errorMessage += "Một số ảnh đã tồn tại trong hệ thống\n";
                    }
                }
                
                Alert.alert(
                    "Upload Thất Bại", 
                    errorMessage,
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                );
                setLoading(false);
                return;
            }

            setAvatarUrls(response.data.urls || []);
            Alert.alert(
                "Thành công", 
                "Upload ảnh thành công",
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
        } catch (error: any) {
            console.error("Upload Error:", error);
            Alert.alert(
                "Lỗi Upload", 
                error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh",
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const selectVideo = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1,
        });

        if (!result.canceled) {
            const videoUri = result.assets[0].uri;
            const videoInfo = await fetch(videoUri);
            const videoBlob = await videoInfo.blob();

            if (videoBlob.size > MAX_VIDEO_SIZE) {
                Alert.alert("Video too large", "Please select a video smaller than 50 MB.");
                return;
            }

            setVideo(videoUri);

            // Generate video thumbnail
            try {
                const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000 });
                setThumbnail(uri);
            } catch (err) {
                console.error("Thumbnail generation error:", err);
            }
        }
    };

    const uploadVideo = async () => {
        if (!video) {
            Alert.alert("Please select a video first");
            return;
        }

        setVideoLoading(true);

        try {
            const formData = new FormData();
            formData.append("video", {
                uri: video,
                type: "video/mp4",
                name: "video.mp4",
            } as any);

            const response = await axios.post<{ url: string; success: boolean; message: string }>(API_URL_UPLOAD_VIDEO, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setVideoUrl(response.data.url);
            Alert.alert("Upload Successful", "Video uploaded successfully");
        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Upload Failed", "Something went wrong.");
        } finally {
            setVideoLoading(false);
        }
    };

    // Hàm reset form
    const resetForm = () => {
        setSelectedCategory("");
        setSelectedBrand("");
        setSelectedVersion("");
        setSelectedCondition("");
        setSelectedRam("");
        setSelectedStorage("");
        setSelectedCpu("");
        setSelectedGpu("");
        setSelectedScreen("");
        setSelectedStorageType("");
        setBattery("");
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedWarranty("3 tháng");
        setSelectedOrigin("Việt Nam");
        setSelectedPostType("Đăng tin thường");
        setImages([]);
        setAvatarUrls([]);
        setVideo(null);
        setVideoUrl(null);
        setThumbnail(null);
        
        // Reset location data
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setDetailAddress("");
        setSelectedLocation("");
        
        // Reset các state khác nếu có
    };

    // Thêm một nút riêng biệt ở đầu trang
    const renderNewPostButton = () => {
        if (isEditMode) {
            return (
                <TouchableHighlight
                    style={{
                        marginVertical: 10,
                        alignSelf: 'center',
                        borderRadius: 8,
                        overflow: 'hidden'
                    }}
                    onPress={() => {
                        Alert.alert(
                            'Xác nhận',
                            'Bạn muốn tạo tin mới thay vì sửa tin này?',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                { 
                                    text: 'Đồng ý', 
                                    onPress: () => {
                                        resetForm(); // Reset form trước khi chuyển trang
                                        router.replace('/postCreation');
                                    }
                                }
                            ]
                        );
                    }}
                >
                    <LinearGradient
                        colors={['#523471', '#9C62D7']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={{ 
                            paddingVertical: 10, 
                            paddingHorizontal: 20, 
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        <Icon name="plus" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            Tạo tin mới
                        </Text>
                    </LinearGradient>
                </TouchableHighlight>
            );
        }
        return null;
    };

    if (pageLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#9661D9" />
                <Text style={{ marginTop: 10 }}>Đang tải thông tin sản phẩm...</Text>
            </View>
        );
    }
    
    return (
        <View className='w-full h-full bg-white p-4'>
            <ScrollView>
                <View className='flex-col gap-5'>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[20px] text-center'>
                        {isEditMode ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}
                    </Text>
                    
                    {/* Hiển thị nút tạo tin mới */}
                    {renderNewPostButton()}
                        <Text className='font-bold text-[16px]'>Danh mục <Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                selectedValue={selectedCategory}
                                onValueChange={handleCategoryChange}
                            >
                                <Picker.Item label="Chọn danh mục" value="" />
                                {categories.map(category => (
                                    <Picker.Item
                                        key={category._id}
                                        label={category.categoryName}
                                        value={category._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <Text className='font-bold text-[16px] uppercase'>Thông tin chi tiết</Text>
                    <View className='flex-col gap-2'>
                        <View className='border-2 border-[#D9D9D9] rounded-lg p-3 flex-col items-center'>
                            <Text className='text-[#9661D9] font-semibold self-end'>Đăng từ 01 đến 06 hình</Text>
                            <View style={{display: images.length > 0 ? 'none' : 'flex', marginTop: 10 }}> <Icon name='camera'  size={40} color='#9661D9' /></View>
                            {images.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, marginTop: 20, marginBottom: 20 }}>
                                {images.map((image, index) => (
                                    <Image key={index} source={{ uri: image }} style={{ width: 100, height: 100, borderRadius: 5, margin: 10 }} />
                                ))}
                            </View>}
                            {/* {avatarUrls.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, marginTop: 20, marginBottom: 20 }}>
                                {avatarUrls.map((url, index) => (
                                    <View key={index} style={{ alignItems: "center" }}>
                                        <Image source={{ uri: url }} style={{ width: 100, height: 100, borderRadius: 5 }} />
                                    </View>
                                ))}
                            </View>} */}
                            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10, marginBottom: 10 }} />}
                            <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 20, marginTop: images.length > 0 ? 0 : 20 }}>
                                <Button title="Chọn ảnh" onPress={selectImages} />
                                <Button title="Tải ảnh lên" onPress={uploadImages} disabled={images.length > 0 ? false : true} />
                            </View>
                            {/* </ScrollView> */}
                        </View>
                    </View>
                    <View className='flex-col gap-2'>
                        <View className='border-2 border-[#D9D9D9] rounded-lg p-3 flex-col items-center'>
                            <Text className='text-[#9661D9] font-semibold self-end'>Đăng tối đa 1 video dưới 50MB</Text>
                            {!video && <Icon className='mt-4' name='video-camera' size={40} color='#9661D9' />}
                            {video && (
                                <Video
                                    source={{ uri: video }}
                                    style={{ width: 300, height: 200, marginTop: 10 }}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                />
                            )}
                            {videoloading && <ActivityIndicator size="large" color="blue" style={{ marginBottom: 20, }}/>}
                            <View style={{ flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 20, marginTop: images.length > 0 ? 0 : 20 }}>
                                <Button title="Chọn video" onPress={selectVideo} />
                                <Button disabled={video ? false : true} title="Tải video lên" onPress={uploadVideo} />
                            </View>

                        </View>
                    </View>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Tình trạng <Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                selectedValue={selectedCondition}
                                onValueChange={(itemValue) => setSelectedCondition(itemValue)}
                            >
                                <Picker.Item label="Chọn tình trạng" value="" />
                                {conditions.map(condition => (
                                    <Picker.Item
                                        key={condition._id}
                                        label={condition.condition}
                                        value={condition._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    {selectedCategory && (
                        <>
                            <View className='flex-col gap-2'>
                                <Text className='font-bold text-[16px]'>Hãng <Text className='text-[#DC143C]'>*</Text></Text>
                                <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                    <Picker
                                        selectedValue={selectedBrand}
                                        onValueChange={handleBrandChange}
                                    >
                                        <Picker.Item label="Chọn hãng" value="" />
                                        {Array.isArray(brands) && brands.map(brand => (
                                            <Picker.Item
                                                key={brand._id}
                                                label={brand.brandName}
                                                value={brand._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            {selectedBrand && filteredVersions.length > 0 && (
                                <View className='flex-col gap-2'>
                                    <Text className='font-bold text-[16px]'>Dòng máy <Text className='text-[#DC143C]'>*</Text></Text>
                                    <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                        <Picker
                                            selectedValue={selectedVersion}
                                            onValueChange={(itemValue) => setSelectedVersion(itemValue)}
                                        >
                                            <Picker.Item label="Chọn dòng máy" value="" />
                                            {filteredVersions.map(version => (
                                                <Picker.Item
                                                    key={version._id}
                                                    label={version.versionName}
                                                    value={version._id}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                    {isLaptopCategory && (
                        <>
                            <View className='flex-col gap-2'>
                                <Text className='font-bold text-[16px]'>Bộ vi xử lý <Text className='text-[#DC143C]'>*</Text></Text>
                                <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                    <Picker
                                        selectedValue={selectedCpu}
                                        onValueChange={(itemValue) => setSelectedCpu(itemValue)}
                                    >
                                        <Picker.Item label="Chọn CPU" value="" />
                                        {Array.isArray(cpus) && cpus.map(cpu => (
                                            <Picker.Item
                                                key={cpu._id}
                                                label={cpu.cpuName}
                                                value={cpu._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            <View className='flex-col gap-2'>
                                <Text className='font-bold text-[16px]'>Card đồ họa <Text className='text-[#DC143C]'>*</Text></Text>
                                <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                    <Picker
                                        selectedValue={selectedGpu}
                                        onValueChange={(itemValue) => setSelectedGpu(itemValue)}
                                    >
                                        <Picker.Item label="Chọn GPU" value="" />
                                        {Array.isArray(gpus) && gpus.map(gpu => (
                                            <Picker.Item
                                                key={gpu._id}
                                                label={gpu.gpuName}
                                                value={gpu._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            <View className='flex-col gap-2'>
                                <Text className='font-bold text-[16px]'>Kích thước màn hình <Text className='text-[#DC143C]'>*</Text></Text>
                                <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                    <Picker
                                        selectedValue={selectedScreen}
                                        onValueChange={(itemValue) => setSelectedScreen(itemValue)}
                                    >
                                        <Picker.Item label="Chọn kích thước màn hình" value="" />
                                        {Array.isArray(screens) && screens.map(screen => (
                                            <Picker.Item
                                                key={screen._id}
                                                label={screen.screenSize}
                                                value={screen._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            <View className='flex-col gap-2'>
                                <Text className='font-bold text-[16px]'>Loại ổ cứng <Text className='text-[#DC143C]'>*</Text></Text>
                                <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                    <Picker
                                        selectedValue={selectedStorageType}
                                        onValueChange={handleStorageTypeChange}
                                    >
                                        <Picker.Item label="Chọn loại ổ cứng" value="" />
                                        {storageTypes.map(type => (
                                            <Picker.Item
                                                key={type._id}
                                                label={type.storageName}
                                                value={type._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </>
                    )}
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Ram <Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                selectedValue={selectedRam}
                                onValueChange={(itemValue) => setSelectedRam(itemValue)}
                            >
                                {rams.map(ram => (
                                    <Picker.Item
                                        key={ram._id}
                                        label={ram.ramCapacity}
                                        value={ram._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Dung lượng pin<Text className='text-[#DC143C]'>*</Text>
                        </Text>
                        <TextInput
                            className='border-2 border-[#D9D9D9] rounded-lg px-2 py-5 font-semibold'
                            placeholder='Nhập dung lượng pin'
                            value={battery}
                            onChangeText={setBattery}
                        />
                    </View>
                    {selectedCategory && (
                        <View className='flex-col gap-2'>
                            <Text className='font-bold text-[16px]'>Dung lượng bộ nhớ <Text className='text-[#DC143C]'>*</Text></Text>
                            <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                <Picker
                                    selectedValue={selectedStorage}
                                    onValueChange={(itemValue) => setSelectedStorage(itemValue)}
                                    enabled={!isLaptopCategory || (isLaptopCategory && selectedStorageType !== "")}
                                >
                                    <Picker.Item
                                        label={
                                            isLaptopCategory && !selectedStorageType
                                                ? "Vui lòng chọn loại ổ cứng trước"
                                                : "Chọn dung lượng bộ nhớ"
                                        }
                                        value=""
                                    />
                                    {filteredStorages.map(storage => (
                                        <Picker.Item
                                            key={storage._id}
                                            label={storage.storageCapacity}
                                            value={storage._id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Chính sách bảo hành <Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                className='font-semibold'
                                selectedValue={selectedWarranty}
                                onValueChange={(itemValue) => setSelectedWarranty(itemValue)}
                            >
                                {warrantyOptions.map((option, index) => (
                                    <Picker.Item key={index} label={option.label} value={option.value} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Xuất xứ<Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                className='font-semibold'
                                selectedValue={selectedOrigin}
                                onValueChange={(itemValue) => setSelectedOrigin(itemValue)}
                            >
                                {originOptions.map((option, index) => (
                                    <Picker.Item
                                        key={index}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View className='flex-col gap-2'>                        <Text className='font-bold text-[16px]'>Giá bán<Text className='text-[#DC143C]'>*</Text></Text>
                        <TextInput
                            className='border-2 border-[#D9D9D9] rounded-lg px-2 py-5 font-semibold'
                            placeholder='10.000 đ'
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <Text className='font-bold text-[16px] uppercase'>Tiêu đề tin đăng và mô tả chi tiết</Text>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Tiêu đề<Text className='text-[#DC143C]'>*</Text></Text>
                        <TextInput
                            className='border-2 border-[#D9D9D9] rounded-lg px-2 py-5 font-semibold'
                            placeholder='Nhập tiêu đề'
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Mô tả chi tiết<Text className='text-[#DC143C]'>*</Text></Text>
                        <TextInput
                            className='border-2 border-[#D9D9D9] rounded-lg px-2 py-5 font-semibold'
                            placeholder='Mô tả ...'
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Hình thức đăng tin<Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                className='font-semibold'
                                selectedValue={selectedPostType}
                                onValueChange={(itemValue) => setSelectedPostType(itemValue)}
                            >
                                {postTypeOptions.map((option, index) => (
                                    <Picker.Item key={index} label={option.label} value={option.value} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <Text className='font-bold text-[16px] uppercase'>Thông tin người bán</Text>
                    <View className='flex-col gap-2'>
                        <Text className='font-bold text-[16px]'>Tỉnh/Thành phố<Text className='text-[#DC143C]'>*</Text></Text>
                        <View className='border-2 border-[#D9D9D9] rounded-lg'>
                            <Picker
                                selectedValue={selectedProvince}
                                onValueChange={handleProvinceChange}
                            >
                                <Picker.Item label="Chọn Tỉnh/Thành phố" value="" />
                                {provinces.map(province => (
                                    <Picker.Item
                                        key={province.code}
                                        label={province.name}
                                        value={province.code}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {selectedProvince && (
                        <View className='flex-col gap-2'>
                            <Text className='font-bold text-[16px]'>Quận/Huyện<Text className='text-[#DC143C]'>*</Text></Text>
                            <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                <Picker
                                    selectedValue={selectedDistrict}
                                    onValueChange={handleDistrictChange}
                                >
                                    <Picker.Item label="Chọn Quận/Huyện" value="" />
                                    {districts.map(district => (
                                        <Picker.Item
                                            key={district.code}
                                            label={district.name}
                                            value={district.code}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}

                    {selectedDistrict && (
                        <View className='flex-col gap-2'>
                            <Text className='font-bold text-[16px]'>Phường/Xã<Text className='text-[#DC143C]'>*</Text></Text>
                            <View className='border-2 border-[#D9D9D9] rounded-lg'>
                                <Picker
                                    selectedValue={selectedWard}
                                    onValueChange={handleWardChange}
                                >
                                    <Picker.Item label="Chọn Phường/Xã" value="" />
                                    {wards.map(ward => (
                                        <Picker.Item
                                            key={ward.code}
                                            label={ward.name}
                                            value={ward.code}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}

                    {selectedWard && (
                        <View className='flex-col gap-2'>
                            <Text className='font-bold text-[16px]'>Địa chỉ chi tiết<Text className='text-[#DC143C]'>*</Text></Text>
                            <TextInput
                                className='border-2 border-[#D9D9D9] rounded-lg px-2 py-3'
                                placeholder='Nhập số nhà, tên đường...'
                                value={detailAddress}
                                onChangeText={handleDetailAddressChange}
                            />
                        </View>
                    )}

                    {selectedLocation && (
                        <View className='mt-2'>
                            <Text className='text-[#666666]'>
                                Địa chỉ đầy đủ: {selectedLocation}
                            </Text>
                        </View>
                    )}
                    <TouchableHighlight
                        className="rounded-lg mt-4 self-end"
                        onPress={handleSubmit}
                    >
                        <LinearGradient
                            colors={['#523471', '#9C62D7']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={{ paddingTop: 12, paddingBottom: 12, paddingStart: 30, paddingEnd: 30, borderRadius: 8 }}
                        >
                            <View className="flex-row items-center justify-center gap-2">
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="font-bold text-[18px] text-[#fff]">
                                        {isEditMode ? 'Cập nhật tin' : 'Đăng tin'}
                                    </Text>
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableHighlight>
                </View>
            </ScrollView>
        </View>
    )
}

