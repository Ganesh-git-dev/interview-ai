export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-2">InterviewAI Pro</h3>
            <p className="text-gray-400 text-sm">
              AI-powered mock interviews for cybersecurity professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>Home</li>
              <li>Login</li>
              <li>Register</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Powered By</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>PWNDORA Labs</li>
              <li>BlackPerl DFIR</li>
              <li>BrewingSec</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            InterviewAI Pro | BrewingSec CyberDev Summit 2026 | PS: BSCDS26-AICR-01
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Built with React, TypeScript, and FastAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
