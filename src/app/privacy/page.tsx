import { Shield, Cookie, Database, Mail, FileText } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} className="mb-6" />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: December 26, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>
              LogsDB (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard information when
              you visit our website at logsdb.com.
            </p>
            <p>
              <strong>In short:</strong> We collect minimal data, don&apos;t sell your information,
              and respect your privacy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-500" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <h4>Automatically Collected</h4>
            <p>When you visit LogsDB, our servers may automatically log:</p>
            <ul>
              <li>IP address (anonymized)</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
            </ul>
            <p>
              This information is used solely for analytics and improving the website.
              We do not use this data to identify individual users.
            </p>

            <h4>GitHub Authentication</h4>
            <p>
              If you choose to contribute to LogsDB using GitHub authentication, we receive:
            </p>
            <ul>
              <li>Your GitHub username</li>
              <li>Your GitHub profile URL</li>
              <li>Your public email (if available)</li>
            </ul>
            <p>
              This information is used only to attribute contributions and is displayed
              publicly on the Contributors page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cookie className="h-5 w-5 text-orange-500" />
              Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>LogsDB uses minimal cookies:</p>
            <ul>
              <li>
                <strong>Theme preference:</strong> Remembers your light/dark mode choice
              </li>
              <li>
                <strong>Session cookie:</strong> If you log in via GitHub for contributions
              </li>
            </ul>
            <p>
              We do not use advertising cookies or third-party tracking cookies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>LogsDB may use the following third-party services:</p>
            <ul>
              <li>
                <strong>GitHub:</strong> For authentication and contribution management
              </li>
              <li>
                <strong>Vercel/Hosting provider:</strong> For website hosting and analytics
              </li>
            </ul>
            <p>
              Each of these services has its own privacy policy governing their data practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of analytics tracking</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@logsdb.com" className="text-primary hover:underline">
                privacy@logsdb.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>
              We implement appropriate security measures to protect your information:
            </p>
            <ul>
              <li>HTTPS encryption for all connections</li>
              <li>Secure authentication via OAuth (GitHub)</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:privacy@logsdb.com" className="text-primary hover:underline">
                  privacy@logsdb.com
                </a>
              </li>
              <li>
                GitHub:{" "}
                <a
                  href="https://github.com/logsdb1/logsdb/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open an issue
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none text-sm">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              any changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
