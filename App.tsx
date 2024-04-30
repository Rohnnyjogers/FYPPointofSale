import { Button, Dimensions, ScrollView, StyleSheet, Text, View, PermissionsAndroid, Alert, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Item, foodList, drinkList } from './src/data/products';
import { Location } from './src/types/types';
import { addProductToReceipt, receiptSubTotal, requestLocation, writeNfc, } from './src/functions/receiptFunctions';
import { generateAndManageRewards } from './src/functions/databaseFunctions';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { request, PERMISSIONS } from 'react-native-permissions';

const App = () => {
  const [foodItems, setFoodItems] = useState<Item[]>(foodList);
  const [drinkItems, setDrinkItems] = useState<Item[]>(drinkList);
  const [productList, setProductList] = useState<Item[]>([...foodList, ...drinkList]);
  const [receipt, setReceipt] = useState<Item[]>([]);
  const [location, setLocation] = useState<Location>({latitude: 0, longitude: 0});
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // requestLocation(setLocation);
    // requestCameraPermission();
    console.log(location);
  },[]);
  
  
  // generateAndManageRewards(2,4,3);
  // setInterval(() => {generateAndManageRewards(2,4,3);
  // }, 5000);

  // const requestCameraPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         {
  //           title: 'Camera Permission',
  //           message: 'This app needs access to your camera to scan QR codes.',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         setHasPermission(true);
  //       } else {
  //         console.log('Camera permission denied');
  //       }
  //     } catch (err) {
  //       console.warn(err);
  //     }
  //   } else {
  //     setHasPermission(true);
  //   }
  // };

  const onSuccess = (e: any) => {
    console.log('Yo!')
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}>
        <Text style={styles.appTitle}>spence POS</Text>
        <View style={styles.productsContainer}>
          <Text style={styles.title}>Food items</Text>
          <View style={styles.itemContainer}>
            {foodItems.map((product) =>
              <View key={product.description}>
                <Button
                  title={product.description}
                  onPress={() => 
                    addProductToReceipt(
                      productList,
                      product.description,
                      receipt,
                      setReceipt
                    )
                  } 
                />
              </View>
            )}
          </View>
            
          <Text style={styles.title}>Drink items</Text>
          <View style={styles.itemContainer}>
            {drinkItems.map((product) =>
              <View key={product.description}>
                <Button
                  title={product.description}
                  onPress={() => 
                    addProductToReceipt(
                      productList,
                      product.description,
                      receipt,
                      setReceipt
                    )
                  }
                />
              </View>
            )}      
          </View>
        </View>

        <View style={styles.transactionContainer}>
          <Text style={styles.title}>Transaction</Text>
          <View style={styles.receiptContainer}>
            <ScrollView>
              <View style={styles.itemListContainer}>
                {receipt.map((item) =>
                    <View style={styles.receiptItems} key={item.description}>
                      <Text>{item.quantity}</Text>
                      <Text> x </Text>
                      <Text>{item.description}</Text>
                      <Text>€{item.price}</Text>
                    </View>
                  )
                }
              </View>
              
              <View style={styles.totalsContainer}>
                <View style={styles.divider}/>
                <View style={styles.subtotalContainer}>
                  <Text style={styles.subtotal}>Sub Total:</Text>
                  <Text style={styles.subtotalValue}>€{receiptSubTotal(receipt)}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
        <View style={styles.buttonContainer}>
            <Button
              title='Apply Transaction'
              onPress={() => 
                writeNfc(
                  receipt,
                  location,
                  setReceipt
                )
              }
            />
            <Button
              title='Clear Transaction'
              onPress={() => setReceipt([])}
            />
        </View>
      </ScrollView>
    </View>
    )
}

export default App;

const styles = StyleSheet.create({
  appTitle: {
    marginTop: 4,
    fontSize: 24
  },
  container: {
    flex: 1,
    paddingStart: 20,
    paddingEnd: 20
  },
  productsContainer: {
    marginTop: 40
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 4,
    padding: 4
  },
  title: {
    marginTop: 10,
    fontSize: 18,
  },
  transactionContainer: {
    marginTop: 40
  },
  itemListContainer: {
    flex: 1,
    height: Dimensions.get('window').height*0.32,
  },
  receiptContainer: {
    flex: 1,
    height: Dimensions.get('window').height*0.4,
    borderWidth: 1,
    borderRadius: 4,
    paddingTop: 10
  },
  receiptItems: {
    marginStart: 10,
    marginEnd: 10,
    flexDirection: 'row',
    gap: 10
  },
  buttonContainer: {
    marginTop: 20,
    rowGap: 10,
    marginBottom: 20
  },
  totalsContainer: {
    alignSelf: 'baseline'
  },
  divider: {
   height: 1,
   width: Dimensions.get('window').width*0.9,
   backgroundColor: '#37474F'
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subtotal: {
    fontSize: 18,
    padding: 12.5
  },
  subtotalValue: {
    fontSize: 18,
    padding: 12.5
  }
})