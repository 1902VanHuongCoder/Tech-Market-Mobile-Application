import {
    Text,
    View,
    TouchableHighlight,
    Image,
    ScrollView,
    TextInput,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

export default function HomePage() {
    const [text, onChangeText] = useState("");
    const [reportVisible, setReportVisible] = useState(false); // State để theo dõi trạng thái hiển thị menu báo cáo
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null); // Chỉ định kiểu cho selectedProductId
    const [selectedReason, setSelectedReason] = useState<string | null>(null); // State để lưu lý do đã chọn

    const products = [
        {
            id: "1",
            name: "Laptop Acer Aspire 3 Spin A3SP14-31PT-387Z",
            configuration: "I3-N305/8GB/512GB/14.0 FHD+/CẢM ỨNG/WIN11/XÁM",
            price: "9.000.000 đ",
            address: "Ba Đình - Hà Nội",
            postingDate: "23:34:23 12/02/2024",
            image:
                "../assets/images/z6316149378615_f6d6f665171bf597c35f86bf13ca61b2.jpg",
            avatar:
                "../assets/images/z6186705977978_00edd678a64db50dba5ef61a50391611.jpg",
            nameUser: "Hoàng Anh Lê",
        },
        {
            id: "2",
            name: "Laptop Acer Aspire 3 Spin A3SP14-31PT-387Z",
            configuration: "I3-N305/8GB/512GB/14.0 FHD+/CẢM ỨNG/WIN11/XÁM",
            price: "9.000.000 đ",
            address: "Ba Đình - Hà Nội",
            postingDate: "23:34:23 12/02/2024",
            image:
                "../assets/images/z6316149378615_f6d6f665171bf597c35f86bf13ca61b2.jpg",
            avatar:
                "../assets/images/z6186705977978_00edd678a64db50dba5ef61a50391611.jpg",
            nameUser: "Hoàng Anh",
        },
        {
            id: "3",
            name: "Laptop Acer Aspire 3 Spin A3SP14-31PT-387Z",
            configuration: "I3-N305/8GB/512GB/14.0 FHD+/CẢM ỨNG/WIN11/XÁM",
            price: "9.000.000 đ",
            address: "Ba Đình - Hà Nội",
            postingDate: "23:34:23 12/02/2024",
            image:
                "../assets/images/z6316149378615_f6d6f665171bf597c35f86bf13ca61b2.jpg",
            avatar:
                "../assets/images/z6186705977978_00edd678a64db50dba5ef61a50391611.jpg",
            nameUser: "Hoàng Anh",
        },
    ];

    const reportReasons = [
        "Nội dung không phù hợp",
        "Hàng giả, hàng nhái",
        "Lừa đảo",
        "Spam",
        "Khác",
    ];

    const handleReportPress = (productId: string) => {
        setSelectedProductId(productId);
        setReportVisible(!reportVisible); // Chuyển đổi trạng thái hiển thị menu báo cáo
    };

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        alert(`Bạn đã chọn lý do: ${reason}`); // Thực hiện hành động báo cáo ở đây
    };

    return (
        <View className="p-4" style={{ flex: 1 }}>
            <View className="flex-col gap-4">
                <View className="flex-row justify-between items-center">
                    <TextInput
                        className="border-2 border-[#D9D9D9] w-2/3 px-2 py-4 text-[#000] rounded-lg font-semibold"
                        onChangeText={onChangeText}
                        value={text}
                        placeholder="Tìm kiếm ..."
                    />
                    <TouchableHighlight className="bg-[#9661D9] px-5 py-4 rounded-lg flex items-center justify-center">
                        <Text className="text-[#fff] font-semibold text-[16px] text-center">
                            Tìm kiếm
                        </Text>
                    </TouchableHighlight>
                </View>
                <Text className="font-bold text-[16px]">Danh sách các sản phẩm phù hợp</Text>
            </View>
            <ScrollView>
                {products.map((product) => (
                    <View
                        key={product.id}
                        className="mt-6 flex-col gap-4 border-b border-[#D9D9D9] pb-4"
                    >
                        <View className="flex-col gap-4">
                            <View className="flex-row gap-2 w-full">
                                <Image
                                    style={{ width: 170, height: 170 }}
                                    source={require("../assets/images/z6316149378615_f6d6f665171bf597c35f86bf13ca61b2.jpg")}
                                />
                                <View className="w-[50%] flex-col gap-1">
                                    <View className="flex-row gap-1">
                                        <Text className="font-bold text-[16px]">{product.name}</Text>
                                        <TouchableHighlight onPress={() => handleReportPress(product.id)}>
                                            <Icon name="ellipsis-v" size={18} color="#9661D9" />
                                        </TouchableHighlight>
                                    </View>
                                    <Text className="text-[12px]">{product.configuration}</Text>
                                    <Text className="font-bold text-[#9661D9] text-[16px]">
                                        {product.price}
                                    </Text>
                                    <View className="flex-row gap-2 items-center">
                                        <Icon name="map-marker" size={20} color="#9661D9" />
                                        <Text className="font-bold text-[14px]">
                                            {product.address}
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-2 items-center">
                                        <Icon name="clock-o" size={20} color="#9661D9" />
                                        <Text className="font-bold text-[14px]">
                                            {product.postingDate}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center w-full">
                                <View className="flex-row gap-2">
                                    <Image
                                        style={{ width: 50, height: 50 }}
                                        className="rounded-full"
                                        source={require("../assets/images/z6186705977978_00edd678a64db50dba5ef61a50391611.jpg")}
                                    />
                                    <View>
                                        <Text className="font-medium text-[14px]">Người bán</Text>
                                        <Text className="font-bold text-[16px]">
                                            {product.nameUser}
                                        </Text>
                                    </View>
                                </View>
                                <View>
                                    <Icon name="comments" size={30} color="#9661D9" />
                                </View>
                            </View>
                        </View>
                        {reportVisible && selectedProductId === product.id && ( // Hiển thị menu báo cáo nếu điều kiện thỏa mãn
                            <View className="bg-[#F4E9FF] p-4 rounded-lg mt-2">
                                <Text className="text-[#000] font-bold text-[18px]">Chọn lý do báo cáo:</Text>
                                {reportReasons.map((reason, index) => (
                                    <TouchableHighlight key={index} underlayColor="#9661D9" onPress={() => handleReasonSelect(reason)}>
                                        <Text className="text-[#9661D9] mt-2 text-[16px] font-medium">{reason}</Text>
                                    </TouchableHighlight>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}