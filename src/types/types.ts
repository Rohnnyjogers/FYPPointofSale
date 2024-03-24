export const VENDOR_NAME = 'The_Corner_Shop';
export const VENDOR_ID = 'TCS001';
export const RECEIPT_ID = '1122278'

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
} & ({viewerType?: never} | {viewerType: string});
