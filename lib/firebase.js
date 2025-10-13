// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅ export storage


// NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAZdoO5rCD2yCKBlonFmRhgPhRmHT_957c
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dst-form.firebaseapp.com
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=dst-form
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dst-form.firebasestorage.app
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=13185796001
// NEXT_PUBLIC_FIREBASE_APP_ID=1:13185796001:web:1dc14a9cb78306e7f5ede0

// # FIREBASE_PROJECT_ID=dstform
// FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dst-form.iam.gserviceaccount.com
// FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8/13qc+1o00f2\nbjuCFolu9pCBB/0NubDEfhUdtCmIWcT55K9Tze4wv3KSheh+I9vELDzdyw+T2aJA\nHLENQT9KoRLRn5CycrVsoZ4TnKzlVq2aBiNCR5YMExih+CID7AQCGxTSg0xAY4yr\nSGsdofBsEsSdMTakfWMyqISrN11vs7JfMQcsNoNACs8YuXA76/aB3dPScq5EUfb7\nilsESK7i3YWAN1VPva8sLS30A4j0lTIalS0VW/Cbak59aKqr5/zqHCxLmqTcIkRw\n0WjhIN7QlCH4K0PVbdyQ6BjUSizJy3t2SPJpiJ3Ndvg7YC/d5EmmuPL7TBmeAPLa\nHVZv7ShPAgMBAAECggEACc6PSFpY4mo7nw75q/IHklFdagya/xzT6arRd9MuVfT8\nO6uTVtwc4pg9sRFmc1W8STr714z6N+ElC12a6OE8fd7LE9WmuGYG74q9WJy/ID8R\nPJZH8fJtIPqNjE4DVURWH3q0+hsj4Wjf1s+6P750WHhq1u2M4hgEYX1WWiV486RH\n7v8TYZ5OycR26MJZj0U2Fs1uZBL2q6rB4P98q3pKUSguB+cv/XNIaj2QItnRTb7X\nVNbXxbqd+FNZeeCEYpb1l6UX8swUrF5Sh0ngWMDYCXDBJhIIb7hxIZIpQAJCL0fR\nT5sJ4hHbyxsOyjknKj7DXcM1XUJ8OijSVjqg2c0k3QKBgQDfrjMwdunvUKkpHYao\nBqFUh/Cy5zzkoUaRTvHfAp4XMd4Y4plVjE8PdjhureEZsKrrY1rFVVg/kc6rtPoQ\nFHCvmdSTg9v1h5Yd50t3hr9dcz5+wfoL2PGkDpJONm0MgZsd/geFg45fgNjFP9i3\nxgFMnnuBmrvcqQDA+7xYr8JO5QKBgQDYTkREUTYHH6/Nbr0mPWVff2rhPKskLZH/\n4GdXRGetxh0u7wg1/gA27L7NYnm55Soc+GAJbKD2kBUIw8alPbj8cyRLVLLpQw+0\nWyyR67BgdkXze+YE2iaQOxDrIVFkXqTHUEx0aa132nu9VMh8sWuG58XKxkMB33jw\nSms76QXzIwKBgBvCHX4lM7DMPMHqdRyC/iBkYl2BTtA8p2o+9ssrIv1T5fEGpeq0\n59bOYAB0OZwbjYp6oPgeOD5jVNeANQwrzTQtjfDkizZ0Jg/99SKXKUZql9XZMrOn\nr40hdcyY+n1z1BErxjkuc0uszLnly3o660xb2o3h6vBeVMaeNuh2n1F1AoGAB6Mr\n0eW0LKg3wt8oGpOMYsTS90T3Hf3l68z2mSQ3LPGT0jZqac2gIFBXpFTXy3KF/CPg\n8DQ/srT/qSGQgAEf6Pn/zBEfiBDwGwQlHLnfrmg+rAwx4PX66pjLTiINB6g31TnG\nmU2p7FNwjwzRT2XMUCUa3MAHWaeUU5etFZ5ysVUCgYEAntM2SMhW3v1tInSdvXdx\nxQiozEI9Z9Oot1YKhRA5YOeA8FVqmZosNIKpOfu+FuhYs3GM0pxJ4A0+59WuZ8st\nMnpXfZS4T8Y0g6U4qTQKVCsSWLZENKAS6bGnZ92ExpeqZgfOC3V1SplvyVh/0zIo\nM9Zw4I5eUumLSi9bgpGER0g=\n-----END PRIVATE KEY-----\n"

// EMAIL_USER=distributors.1click@gmail.com
// EMAIL_PASS=rmboyhsxlatozxya
