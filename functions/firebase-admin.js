// FIREBASE
import admin from 'firebase-admin';

//ADMIN OBJECT
const serviceAccountKey = {
      "type": "service_account",
      "project_id": "my-ccc-landing-page-gen2",
      "private_key_id": "019a3f121aa81143d9b742a250de18c3c290ad0a",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDcTwcHXjQVAWYR\nQs8Wg7r/N1zloCuo0ACIEpMHtZKKCejamimoMqr0DeSehssxxJxcIZUZ8o2nOyPv\nV93NeXH/ek2Mv84jMPgbkEacIS3+uJxkk1QodYiHtUaGqMKTD0PF+ACkv7Hn8AH1\nnBa6J1dd677l8u0G18UPOdEkv6hb9M6dGYTT2l1uO2UfmLuv+6pNeUx+omrB4JmN\nIEePRXRBcx+wvG2pu3QZzG52AlSC9CwNM4Mh7zz0aqM6dRuMpOxaKh2EiZjBd0ZZ\nLU7zBJdofO0ll+WkDhJZcR1Uwc5SwiFsY1FZGnuloz1XdGln7F9AVBbNJ55vYc6D\nPrj7kZ2LAgMBAAECggEATzREQSRfkhu2H8eGn0AN1xqG1fE/MQpS3pja7l8bh3An\nnIvnJRbOOj7SbiHk5IgcdM0IB1OaFMDg2vgagHhEgUZtoggFKsa8tGAq2o/dMuIZ\nK9mB3KfgxXVpHRmIFona4k4WoSRf6BR0B+KtkxB4ywXp1E8BYz/ok2BEbjNPantO\nkxm+9L9zXS9gXpYq9yu5DgRjM4w7WVHPGyHpx+zn/BdyvVG/HXA/6DaXaJ29dKvo\n0h2CEXkvBFykxMnizWkz1i8heoyr5wFbz1nRpICeklFhDs21woWk30D0NTT0bNtC\nDVezTXedfFAAzpfvUG97CwO5/Ej1lRvMG1ZQnVQ2ZQKBgQDxED2Vad4azicuYQLM\n29yeGEIVzrteHWoGBkOj76ZTVXoO8v2vE6pD3Y6kG6a+xK46DMAgB2JUws/0NDLR\nQFsb0m6U98+S2atcaxGXunDiE/Rb6DhFshNomYL6pn/v/BbNMeSG76pBJHUN+pg6\n9sbxiY6VkEggsLfWm5cgQsiZdQKBgQDp9ZMDTueqAYxDPWXzo2DGL0G6jvy4muk1\nz0+KFi+VCbpaeCuIZ6s5zXGVXHgrooUDKb2DSV2h+LqLXv+nL8iSDn/Le5MHSI23\n0rMOkXImgKx+kkVq0qUfZicxw+eHTLQyLQk3ijmX7f7OW3pCjKXxMvJd/xa4aRzg\nT0g+h0N6/wKBgFhMD5Kb3YvJ+RYG2KS635tU3Vfpij3V3lDomHwCutSJWZUCMiOf\nu1zyWV4I9tGnbv26T+ErczwCw3L6b6avwO9266RLBNAQRLEsUpxV4SUeFAJaE8qL\niIpmuFAhDnmTx7JPVRqLzLvho7KEGKB4ZbRxIzXrTFAVCrFj+j4J2DpFAoGAKagt\nHfitrQqLg+lpvsDHWWJOrL4K53/FqGwaOHcMz9ekk7kz3xy+UxNudu65AuP0FQUY\nlki44D8eT/SBRq5uYvsr6/o7yp8zhJiCg0SIc6yTihHXRFbvSbDxp52/GssghpKY\nQohdCt04clu9YB4U6eZtWykxTXKBzrqvHVsOO9cCgYA01aA32qS/zhinf9lbXIx7\n2Y8JnmiJYkEC5X+CDW0iU7peU2dpvwNR1ZyOyxR6sYrszeH4XQLrt/wQG6UHcEGc\nCXS2mQE6MHsEhgLmQBIG4OrC7aDm4xXlwMLfGcSPW2z1ZTZYAEfz7YlkRvYA7++h\nsJTDqQqvSKCLCum1qQMMQQ==\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-owps8@my-ccc-landing-page-gen2.iam.gserviceaccount.com",
      "client_id": "101008465244720027040",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-owps8%40my-ccc-landing-page-gen2.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
}
const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey)
});
// FIRESTORE OBJECT
const firestore = app.firestore();

export { firestore };

