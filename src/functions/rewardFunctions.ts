import AsyncStorage from "@react-native-async-storage/async-storage";

const getPrevRewardId = async() => {
    try{
         const prevRewardId = await AsyncStorage.getItem('prevRewardId');
         if(prevRewardId !== null){
             return parseInt(prevRewardId);
         }
       return 0;
     }catch(error){
         console.error('Error handling previous reward ID: ', error);
       return 0;
     }
 }
 
 const savePrevRewardId = async(id: number) => {
     try{
         await AsyncStorage.setItem('prevRewardId', id.toString());
     }catch(error){
         console.error('Error setting previous reward ID: ', error);
     }
 }
 
 export const generateRewardId = async() => {
     const prevRewardId = await getPrevRewardId();
     const newRewardId = prevRewardId + 1;
     await savePrevRewardId(newRewardId);
   
     return newRewardId;
 }