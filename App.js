import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { GOOGLE_API_KEY, GOOGLE_GEOCODING_API_URL } from "@env";
import * as Location from "expo-location";

export default function App() {
  const delta = 0.05;
  const initialDelta = 8;
  const [search, setSearch] = useState();
  const [title, setTitle] = useState("My Home");
  const [marker, setMarker] = useState({
    latitude: 61.92410999999999,
    longitude: 25.748151,
  });
  const [region, setRegion] = useState({
    latitude: 61.92410999999999,
    longitude: 25.748151,
    latitudeDelta: initialDelta,
    longitudeDelta: initialDelta,
  });

  let url =
    GOOGLE_GEOCODING_API_URL + "?address=" + search + "&key=" + GOOGLE_API_KEY;

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("No permission to get location");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    setTitle("You are here");
    setRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    });
    setMarker({
      latitude: latitude,
      longitude: longitude,
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  const searchLocation = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status !== "ZERO_RESULTS") {
        const latitude = data.results[0].geometry.location.lat;
        const longitude = data.results[0].geometry.location.lng;
        setTitle(data.results[0].formatted_address);
        setMarker({
          latitude: latitude,
          longitude: longitude,
        });
        setRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        });
      } else if (search == undefined) {
        Alert.alert("Fill in search terms");
      } else {
        Alert.alert("No results found!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(marker);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView style={styles.map} region={region} initialRegion={region}>
        <View style={styles.searchContainer}>
          <Ionicons name="location-sharp" size={26} color="black" />
          <TextInput
            style={styles.input}
            onChangeText={(search) => setSearch(search)}
            placeholder="Search with full address"
            value={search}
            keyboardType="default"
          />
          <Pressable style={styles.button} onPress={searchLocation}>
            <Ionicons name="search" size={26} color="black" />
          </Pressable>
        </View>
        <Marker coordinate={marker} title={title} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    marginTop: 45,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    zIndex: 4, // works on ios
    elevation: 4, // works on android
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  input: {
    width: "80%",
    height: 45,
    padding: 5,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
