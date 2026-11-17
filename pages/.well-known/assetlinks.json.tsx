import { GetServerSideProps } from 'next';

// Serves /.well-known/assetlinks.json for Android App Links verification.
// package_name must match applicationId in android/app/build.gradle.kts (app.amtips.official).
// sha256_cert_fingerprints must match the Google Play App Signing certificate for this app.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const json = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.amtips.official',
        sha256_cert_fingerprints: [
          'F9:3B:EB:15:EB:A9:36:19:37:24:F6:FD:DE:36:B0:A2:09:8F:84:E1:EF:AA:D7:5B:36:21:8A:40:E5:CE:32:2D',
        ],
      },
    },
  ];
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.write(JSON.stringify(json, null, 2));
  res.end();
  return { props: {} };
};

export default function AssetLinks() { return null; }
