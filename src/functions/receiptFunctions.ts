import AsyncStorage from "@react-native-async-storage/async-storage";
import { Item } from "../data/Products";
import React, { SetStateAction, useContext } from "react";
import NfcManager, { Ndef, NfcTech, } from 'react-native-nfc-manager';
import Geolocation from '@react-native-community/geolocation';
import { PERMISSIONS, request } from 'react-native-permissions';
import { Location, ReceiptProps, TAX_TYPE, VENDOR_ID, VENDOR_NAME, VENDOR_TYPE } from "../types/types";
import { Alert } from "react-native";

export const requestLocation = async(
  setLocation: React.Dispatch<SetStateAction<Location>>
) => {
  try{
    const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if(granted === 'granted'){
      Geolocation.getCurrentPosition(
        (position: { coords: { latitude: any; longitude: any; }; }) => {
          const {latitude, longitude} = position.coords;
          setLocation({latitude, longitude});
        },
        (error: any) => {
          console.error(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 10000
        }
      )
    }
    else {
      console.error("Denied permission to access location.");
    }
  }
  catch(error){
    console.error(error);
  }
}

const getPrevReceiptId = async() => {
   try{
        const prevReceiptId = await AsyncStorage.getItem('prevReceiptId');
        if(prevReceiptId !== null){
            return parseInt(prevReceiptId);
        }
      return 0;
    }catch(error){
        console.error('Error handling previous receipt ID: ', error);
      return 0;
    }
}

const savePrevReceiptId = async(id: number) => {
    try{
        await AsyncStorage.setItem('prevReceiptId', id.toString());
    }catch(error){
        console.error('Error setting previous receipt ID: ', error);
    }
}

export const generateReceiptId = async() => {
    const prevReceiptId = await getPrevReceiptId();
    const newReceiptId = prevReceiptId + 1;
    await savePrevReceiptId(newReceiptId);
  
    return newReceiptId;
}

export const addProductToReceipt = async(
    productList: Item[],
    product: string,
    receipt: Item[],
    setReceipt: React.Dispatch<React.SetStateAction<Item[]>>,
  ) => {
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
      console.error('Item not found in product list.');
    }
}

export const receiptSubTotal = (receipt: Item[]) => {
    const subTotal = receipt.reduce((acc, itm) => {
      const itemSubTotal = itm.quantity * itm.price;
      return acc + itemSubTotal;
    }, 0);

  return subTotal;
}

export const receiptItemsTotal = (receipt: Item[]) => {
    const itemsTotal = receipt.reduce((acc, itm) => {
        const quantity = itm.quantity;
        return acc + quantity;
    }, 0);

  return itemsTotal;
}

export const writeNfc = async(
    receipt: Item[],
    location: Location,
    setReceipt: React.Dispatch<SetStateAction<Item[]>>
) => {
    const receiptId: number = await generateReceiptId()
    const vendorId: string = VENDOR_ID;
    const currentDate: Date = new Date();
    const receiptDate: Date = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate(),currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds());
    const vendorName: string = VENDOR_NAME;
    const latitude: number = location.latitude;
    const longitude: number = location.longitude;
    const items: Item[] = receipt;
    const itemsTotal: number = receiptItemsTotal(receipt);
    const priceTotal: number = receiptSubTotal(receipt);
    const taxType: string = TAX_TYPE;
    const vendorType: string = VENDOR_TYPE;

    const receiptData: ReceiptProps = {
      receiptId,
      vendorId,
      receiptDate,
      vendorName,
      latitude,
      longitude,
      items,
      priceTotal,
      itemsTotal,
      taxType,
      vendorType
    } 

    const jsonStringReceipt = JSON.stringify(receiptData);
    console.log(jsonStringReceipt);

    try{
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.textRecord(jsonStringReceipt)]);
      if(bytes){
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('Transaction successful.');
        setReceipt([]);
      }
    }
    catch(error){
      console.log('Nfc Manager error:', error);
    }
    finally{
      NfcManager.cancelTechnologyRequest();
    }
  }
