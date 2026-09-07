import { GetServerSideProps } from 'next';

const AFRIPAY_URL = 'https://www.afripay.africa/checkout/index.php';
const NOTIFY_URL = 'https://ygtgfqitctowlhkqomjw.supabase.co/functions/v1/afripay-callback';

function esc(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

type Props = {
  amount: string;
  currency: string;
  client_token: string;
  comment: string;
  return_url: string;
  app_id: string;
  app_secret: string;
};

// Auto-submits AfriPay form — used by the Flutter app WebView.
export default function CheckoutRedirect(props: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Connecting to AfriPay…</title>
      </head>
      <body style={{ fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: 0, background: '#f8f9fa' }}>
        <p>Connecting to AfriPay…</p>
        <form id="f" action={AFRIPAY_URL} method="POST">
          <input type="hidden" name="amount"       defaultValue={props.amount} />
          <input type="hidden" name="currency"     defaultValue={props.currency} />
          <input type="hidden" name="comment"      defaultValue={props.comment} />
          <input type="hidden" name="client_token" defaultValue={props.client_token} />
          <input type="hidden" name="return_url"   defaultValue={props.return_url} />
          <input type="hidden" name="notify_url"   defaultValue={NOTIFY_URL} />
          <input type="hidden" name="app_id"       defaultValue={props.app_id} />
          <input type="hidden" name="app_secret"   defaultValue={props.app_secret} />
        </form>
        <script dangerouslySetInnerHTML={{ __html: 'document.getElementById("f").submit();' }} />
      </body>
    </html>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { amount, currency = 'BIF', client_token, comment, return_url } = query;

  // Validate required params
  if (!amount || !client_token) {
    return { notFound: true };
  }

  return {
    props: {
      amount: String(amount),
      currency: String(currency),
      client_token: String(client_token),
      comment: String(comment ?? ''),
      return_url: String(return_url ?? ''),
      app_id: process.env.AFRIPAY_APP_ID!,
      app_secret: process.env.AFRIPAY_APP_SECRET!,
    },
  };
};
