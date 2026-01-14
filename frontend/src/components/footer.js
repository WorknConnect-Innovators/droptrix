import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#1d2150] text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4   lg:grid-cols-5 gap-8">
        {/* Section 1 */}
        <div>
          <h4 className="font-semibold mb-4">Join Us</h4>
          <ul className="space-y-2 text-sm">
            <li>Prepaid plans</li>
            <li>Free SIM</li>
            <li>Become a retailer</li>
            <li>Student offers</li>
            <li>Register on website</li>
            <li>Reviews</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>Rates</li>
            <li>Quick recharge</li>
            <li>Coverage & services</li>
            <li>Activate plan</li>
            <li>Plan changes update</li>
            <li>Refer a Friend</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h4 className="font-semibold mb-4">Help & Support</h4>
          <ul className="space-y-2 text-sm">
            <li>Contact us</li>
            <li>Security</li>
            <li>Cookie policy</li>
            <li>FAQ</li>
            <li>Port-in status</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>About us</li>
            <li>Blog</li>
            <li>Privacy policy</li>
            <li>Terms & conditions</li>
            <li>Billing notice</li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-500 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between px-6 max-w-7xl mx-auto text-sm">
        <p>© 2025 Droptrix. All rights reserved.</p>
        <div className="flex gap-4 mt-3 md:mt-0">
          <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
          <FaTwitter className="hover:text-sky-400 cursor-pointer" />
          <FaInstagram className="hover:text-pink-400 cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
