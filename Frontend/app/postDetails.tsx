import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from '@/components/Carousel';

const { width: viewportWidth } = Dimensions.get('window');

export default function PostDetailsScreen() {
  const [expanded, setExpanded] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Carousel />
      <View style={styles.content}>
        <Text style={styles.postName}>Laptop gaming ASUS 16GB 256GB</Text>
        <Text style={styles.description}>This is a detailed description of the post. It provides all the necessary information about the post.</Text>
        <Text style={styles.price}>100 VND</Text>
        <Text style={styles.location}>Location: New York, USA</Text>
        <Text style={styles.location}>Time: 20:30 01/01/2025</Text>
        <Text style={styles.location}>Mô tả chi tiết</Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.expandText}>
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
        </TouchableOpacity>
        {expanded && (
          <Text style={styles.expandedText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus orci at augue blandit euismod. Morbi et ex convallis, congue risus venenatis, efficitur magna. Pellentesque non nisi maximus, elementum sem at, gravida ligula. Integer dapibus arcu sit amet libero malesuada accumsan. Suspendisse vehicula fringilla accumsan. Nullam accumsan leo quis luctus blandit. Mauris dapibus vitae eros ac accumsan...
          </Text>
        )}
        <Text style={styles.specs}>Thông số kỹ thuật</Text>
        <View style={styles.specsContainer}>
          <View style={styles.specItem}>
            <Ionicons name="hardware-chip-outline" size={24} color="black" />
            <Text style={styles.specText}>CPU: Intel Core i7</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="at-sharp" size={24} color="black" />
            <Text style={styles.specText}>RAM: 16GB</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="disc-outline" size={24} color="black" />
            <Text style={styles.specText}>Storage: 256GB SSD</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="laptop-outline" size={24} color="black" />
            <Text style={styles.specText}>Display: 15.6" FHD</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="battery-charging-outline" size={24} color="black" />
            <Text style={styles.specText}>Battery: 97%</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonWrapper}>
            <LinearGradient
              colors={['rgba(156,98,215,1)', 'rgba(82,52,113,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button} 
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
              <Text style={styles.buttonText}>NHẮN TIN</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.buttonWrapper}>
            <LinearGradient
              colors={['rgba(156,98,215,1)', 'rgba(82,52,113,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Ionicons name="call-outline" size={24} color="white"/>
              <Text style={styles.buttonText}>GỌI ĐIỆN</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  slide: {
    width: viewportWidth,
    height: 200,
  },
  image: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 20,
  },
 
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 10,
  },
  location: {
    fontSize: 16,
    marginVertical: 10,
  },
  details: {
    fontSize: 16,
    marginVertical: 10,
  },
  specs: {
    fontSize: 16,
    marginVertical: 10,
    borderTopColor: 'gray',
    borderTopWidth: 1,
    borderStyle: 'solid',
    paddingVertical: 10,
    paddingTop: 30,
  },
  specsContainer: {
    marginTop: 1,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  specText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 6,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 40,
    borderRadius: 5,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  expandText: {
    fontSize: 18,
    color: 'blue',
    textAlign: 'center',
  },
  expandedText: {
    fontSize: 16,
    marginVertical: 10,
    fontFamily: 'Knewave',
  },
  postName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    fontFamily: 'Knewave',
  },
});

