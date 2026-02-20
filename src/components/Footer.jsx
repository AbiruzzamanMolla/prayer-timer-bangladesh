import { FaGithub, FaFacebook, FaLinkedinIn, FaHeart } from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-text">
        Developed by{" "}
        <a
          href="https://abiruzzamanmolla.github.io"
          target="_blank"
          rel="noreferrer"
        >
          Abir
        </a>
      </div>

      <div className="social-links">
        <a
          href="https://www.supportkori.com/abiruzzaman"
          target="_blank"
          rel="noreferrer"
          title="Buy me a coffee"
        >
          <SiBuymeacoffee />
        </a>
        <a
          href="https://github.com/AbiruzzamanMolla"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.facebook.com/abiruzzaman.molla/"
          target="_blank"
          rel="noreferrer"
          title="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.linkedin.com/in/abiruzzamanmolla/"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
        >
          <FaLinkedinIn />
        </a>
      </div>
    </div>
  );
}
