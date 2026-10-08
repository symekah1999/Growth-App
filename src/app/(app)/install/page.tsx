import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { InstallApp } from "@/components/InstallApp";
import { Smartphone, Monitor, Package } from "lucide-react";

const APP_URL = "https://growth-app-ruddy-two.vercel.app";

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="ml-4 list-decimal space-y-1.5 text-sm text-neutral-300">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  );
}

export default async function InstallPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="Install Growth OS"
        subtitle="Put the app on your phone or computer so it opens like any other app — full screen, own icon, no browser bars."
      />

      <Card className="mb-6">
        <p className="mb-3 text-sm text-neutral-400">One tap, if your browser supports it:</p>
        <InstallApp />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-100">
            <Smartphone size={18} className="text-indigo-400" /> Phone
          </h2>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Android (Chrome)</p>
          <Steps
            items={[
              "Open this site in Chrome and sign in.",
              "Tap the ⋮ menu → Install app (or Add to Home screen).",
              "Confirm. The Growth OS icon appears with your other apps.",
            ]}
          />
          <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">iPhone / iPad (Safari)</p>
          <Steps
            items={[
              "Open this site in Safari (not Chrome).",
              "Tap the Share button.",
              "Choose Add to Home Screen → Add.",
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-100">
            <Monitor size={18} className="text-indigo-400" /> Desktop
          </h2>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">Chrome / Edge</p>
          <Steps
            items={[
              "Click the install icon at the right end of the address bar (or the button above).",
              "Or open the ⋮ / … menu → Save and share → Install page as app (Chrome), Apps → Install this site as an app (Edge).",
              "Growth OS opens in its own window and can be pinned to the taskbar or dock.",
            ]}
          />
          <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Safari (Mac)</p>
          <Steps items={["File → Add to Dock."]} />
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-100">
          <Package size={18} className="text-indigo-400" /> Android APK
        </h2>
        <p className="mb-3 text-sm text-neutral-400">
          The installed web app is the same thing as an APK, and it updates itself. If you want a real
          .apk file to share or sideload, wrap this site with PWABuilder (free, no coding):
        </p>
        <Steps
          items={[
            "Go to pwabuilder.com and enter " + APP_URL + ".",
            "Click Start, then Package for stores → Android.",
            "Package ID: com.symekah.growthos · App name: Growth OS. Leave signing on “New” and download the zip.",
            "The zip contains the signed .apk (install on a phone) and an .aab (for Google Play), plus signing.keystore and assetlinks.json — back up the keystore.",
            "Put assetlinks.json at public/.well-known/assetlinks.json in the project, push it, then the app opens without the browser address bar.",
          ]}
        />
        <p className="mt-3 text-xs text-neutral-500">
          To install the .apk, copy it to your phone and allow “Install unknown apps” for your file manager.
        </p>
      </Card>
    </div>
  );
}
