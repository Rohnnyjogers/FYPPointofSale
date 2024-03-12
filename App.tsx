import { Button, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import NfcManager, { Ndef, NfcTech, } from 'react-native-nfc-manager';
import { Item, foodList, drinkList } from './src/data/Products';
const App = () => {

  const [foodItems, setFoodItems] = useState<Item[]>(foodList);
  const [drinkItems, setDrinkItems] = useState<Item[]>(drinkList);
  const [productList, setProductList] = useState<Item[]>([...foodList, ...drinkList]);
  const [receipt, setReceipt] = useState<Item[]>([]);

  const addProductToReceipt = (product: string) => {
    const itemSelected = productList.find((item) => item.description === product)

    if(itemSelected){
      
      const existingItem = receipt.find((item) => item.description === product);
      
      if(existingItem){
        setReceipt((currentReceipt) =>
          currentReceipt.map((item) => 
            item.description === product ? 
              {...item, quantity: item.quantity + 1} : item));
      } else{
        setReceipt((prev) => ([...prev, itemSelected]));
      }
    } else{

      if(!itemSelected){
        console.log('Item not found');
      } else{
        setReceipt((prev) => [...prev, {...(itemSelected as Item), quantity: 1}]);
      }
    }
  }

  const receiptSubTotal = () => {
    const subTotal = receipt.reduce((acc, itm) => {
      const itemSubTotal = itm.quantity * itm.price;
      return acc + itemSubTotal;
    }, 0);

    return subTotal;
  }

  const receiptItemsTotal = () => {
    const itemsTotal = receipt.reduce((acc, itm) => {
      const quantity = itm.quantity;
      return acc + quantity;
    }, 0);

    return itemsTotal;
  }

  const clearTransaction = () => {
    setReceipt(prev => []);
  }

  const writeNfc = async() => {

    const vendorName: string = 'The Corner Shop';
    const vendorId: string = 'V123654';
    const receiptId: string = '1122235';
    //location
    const items: Item[] = receipt;
    const priceTotal: number = receiptSubTotal();
    const itemsTotal: number = receiptItemsTotal();

    const receiptData = {
      vendorName,
      vendorId,
      receiptId,
      items,
      priceTotal,
      itemsTotal
    }

    const jsonStringReceipt = JSON.stringify(receiptData);
    console.log(jsonStringReceipt);

    try{
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // const hasNdef = NfcManager.requestTechnology(NfcTech.Ndef);
      // if(hasNdef != null){
      // }
      
      const bytes = Ndef.encodeMessage([Ndef.textRecord(jsonStringReceipt)]);
      console.log('Encoded bytes value:', bytes);
      console.log('Decoded bytes value:', Ndef.decodeMessage(bytes));

      if(bytes){
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
      }
    }
    catch(error){
      console.log('Nfc Manager error:', error);
    }
    finally{
      NfcManager.cancelTechnologyRequest();
    }
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
                  addProductToReceipt(product.description)}
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
                  addProductToReceipt(product.description)}
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
              )}
            </View>
            
            <View style={styles.totalsContainer}>
              <View style={styles.divider}/>
              <View style={styles.subtotalContainer}>
                <Text style={styles.subtotal}>Sub Total:</Text>
                <Text style={styles.subtotalValue}>€{receiptSubTotal()}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
        </View>

        <View style={styles.buttonContainer}>
            <Button
              title='Apply Transaction'
              onPress={writeNfc}
            />

            <Button
              title='Clear Transaction'
              onPress={clearTransaction}
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