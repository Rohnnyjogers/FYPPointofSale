import { child, get, ref, set, update } from 'firebase/database';
import { database } from '../../firebaseconfig';
import { PurchaseProps, Reward, VENDOR_ID, VENDOR_NAME } from '../types/types';
import { generateRewardId } from './rewardFunctions';
import { Alert } from 'react-native';

export const generateAndManageRewards = async(
  initialRewardSize: number,
  rewardSize: number,
  nextRewardSize: number,
) => {
    const dbRef = ref(database, `/vendors/${VENDOR_NAME}/${VENDOR_NAME}_${VENDOR_ID}/customers`);
    try{
      const customersSnapshot = await get(dbRef);
      const customers = Object.keys(customersSnapshot.val());
      
      for(const customerId of customers){
        const customerRef = ref(database, `/vendors/${VENDOR_NAME}/${VENDOR_NAME}_${VENDOR_ID}/customers/${customerId}/purchases`);
        try{
          const purchasesSnapshot = await get(customerRef);

          if(purchasesSnapshot.exists()){
            const purchases = purchasesSnapshot.val();
            
            for(const item of Object.keys(purchases)){

              const itemData: PurchaseProps = purchases[item];
              const itemRef = child(customerRef, item);
              let rewardData: Reward;

              if(itemData.rewardable){
                
                if(itemData.activeReward){
                  continue;
                }
                else if(itemData.nextRewardCount === itemData.rewardCount){
                  console.log('Yo bud');
                  
                  const rewardId = await generateRewardId();
                  rewardData = {
                    active: false,
                    rewardId: rewardId,
                    vendor: VENDOR_NAME,
                    vendorId: VENDOR_ID,
                    item: item,
                    size: rewardSize,
                    progress: 0,
                    claimed: false,
                    complete: false
                  }
                  
                  update(itemRef, {rewardCount: -rewardSize});
                  update(itemRef, {nextRewardCount: nextRewardSize})
                  const customerRewardRef = ref(database, `/users/${customerId}/rewards/${VENDOR_NAME}_${VENDOR_ID}_${rewardId}_${item}`);
                  set(customerRewardRef, rewardData);
                }
                else if(itemData.rewardCount===undefined && itemData.quantity>=initialRewardSize){
                    console.log('Yo yo bud');
                    
                    const rewardId = await generateRewardId();
                    rewardData = {
                      active: false,
                      rewardId: rewardId,
                      vendor: VENDOR_NAME,
                      vendorId: VENDOR_ID,
                      item: item,
                      size: rewardSize,
                      progress: 0,
                      claimed: false,
                      complete: false
                    }
                    
                    update(itemRef, {rewardCount: -rewardSize});
                    update(itemRef, {nextRewardCount: nextRewardSize});
                    const customerRewardRef = ref(database, `/users/${customerId}/rewards/${VENDOR_NAME}_${VENDOR_ID}_${rewardId}_${item}`);
                    set(customerRewardRef, rewardData);
                }
              }
            }
          }
        }
        catch(error){
          console.error('Error retrieving customer receipts: ', error);
        }
      }
    }catch(error){
      console.error('Error retrieving customers: ', error);
    }
  }