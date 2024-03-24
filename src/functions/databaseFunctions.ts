import { get, ref, set } from 'firebase/database';
import { database } from '../../firebaseconfig';
import { VENDOR_ID, VENDOR_NAME } from '../types/types';

export const checkCustomersForRewards = async() => {
    const dbRef = ref(database, `/vendors/${VENDOR_NAME}/${VENDOR_NAME}_${VENDOR_ID}/customers`);

    try{
      const customersSnapshot = await get(dbRef);
      const customers = Object.keys(customersSnapshot.val());
      for(const customerId of customers){
        console.log(customerId);
        const customerRef = ref(database, `/vendors/${VENDOR_NAME}/${VENDOR_NAME}_${VENDOR_ID}/customers/${customerId}/purchases`);
        try{
          const purchasesSnapshot = await get(customerRef);
          if(purchasesSnapshot.exists()){
            const purchases = purchasesSnapshot.val();
            Object.keys(purchases).forEach((item) => {
              const itemData = purchases[item];
              console.log(`Item: ${item} quantity:`, itemData.quantity);
              if(itemData.quantity >= 2){
                const RewardData = {
                  active: false,
                  item: item,
                  stamps: 8,
                }
                const customerRewardRef = ref(database, `/users/${customerId}/rewards/${item}_${VENDOR_NAME}_${VENDOR_ID}`);
                set(customerRewardRef, RewardData);
              }             
              // items.forEach((item: Item) => {
              //   if(item){}
              // })              
            })
          }
        }catch(error){
          console.error('Error retrieving customer receipts: ', error);
        }
      }
    }catch(error){
      console.error('Error retrieving customers: ', error);
    }
  }