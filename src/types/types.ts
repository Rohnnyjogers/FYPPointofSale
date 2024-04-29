export const VENDOR_NAME = 'The_Corner_Shop';
export const VENDOR_ID = 'TCS001';
export const TAX_TYPE = 'VAT';
export const VENDOR_TYPE ='Groceries';

export type Location = {
    latitude: number;
    longitude: number;
}

type Item = {
    quantity: number;
    description: string;
    price: number;
}

export type ReceiptProps = {
    receiptId: number;
    vendorId: string;
    receiptDate: Date;
    vendorName: string;
    latitude: number;
    longitude: number;
    items: Item[];
    itemsTotal: number;
    priceTotal: number;
    taxType: string;
    vendorType: string;
}

export type Reward = {
    active: boolean;
    rewardId: number;
    vendor: string;
    vendorId: string;
    item: string;
    size: number;
    progress: number;
    claimed: boolean;
    complete: boolean;
}

export type PurchaseProps = {
    quantity: number;
    rewardable: boolean;
    activeReward: boolean;
    rewardCount: number | null;
    nextRewardPhase: boolean;
    nextRewardCount: number;
    totalCompleteRewards: number;
}