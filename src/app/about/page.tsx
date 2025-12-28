import {
  Database,
  Users,
  BookOpen,
  Shield,
  Github,
  Globe,
  Target,
  Heart,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <Breadcrumb items={[{ label: "About" }]} className="mb-6" />

      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">About LogsDB</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The Universal Log Encyclopedia. Know your logs. Parse anything. Anywhere.
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            LogsDB was created to solve a common problem faced by developers, system
            administrators, and security professionals: understanding and parsing the
            countless log formats across different technologies.
          </p>
          <p>
            Whether you&apos;re debugging an Nginx issue, analyzing Apache access patterns,
            investigating Linux authentication logs, or building a SIEM pipeline, LogsDB
            provides the comprehensive documentation and tools you need.
          </p>
          <p>
            Our goal is to be the definitive reference for log formats—a Wikipedia for logs
            that the community can contribute to and improve over time.
          </p>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Detailed log format specifications
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Field-by-field explanations
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Real-world log examples
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Regex patterns for parsing
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-purple-500" />
              Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Web servers (Nginx, Apache, IIS)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Operating systems (Linux, Windows)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Databases (PostgreSQL, MySQL, MongoDB)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Containers (Docker, Kubernetes)
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-orange-500" />
              Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Regex Builder with 70+ patterns
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Interactive log parser
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Sample log generator
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Export to Logstash, Fluentd, Vector
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-cyan-500" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Open source on GitHub
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Wikipedia-style contributions
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Transparent review process
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Community-driven improvements
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Open Source */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Free and Open Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            LogsDB is completely free to use and open source. Our documentation, tools,
            and data are available to everyone. We believe that knowledge about log formats
            should be accessible to all developers and operators.
          </p>
          <p className="text-muted-foreground mb-6">
            The project is hosted on GitHub where anyone can contribute new log formats,
            improve existing documentation, fix errors, or suggest new features.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a
                href="https://github.com/logsdb1/logsdb"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contribute">
                <Users className="h-4 w-4 mr-2" />
                Contribute
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Contact
          </CardTitle>
          <CardDescription>
            Have questions, suggestions, or want to report an issue?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="text-muted-foreground">Issues & Features:</span>
              <a
                href="https://github.com/logsdb1/logsdb/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Issues
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="text-muted-foreground">Email:</span>
              <a
                href="mailto:contact@logsdb.com"
                className="text-primary hover:underline"
              >
                contact@logsdb.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
