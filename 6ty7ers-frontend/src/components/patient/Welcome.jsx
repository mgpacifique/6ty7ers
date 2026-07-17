import './welcome.css';

export default function Welcome({ onGetStarted }) {
  return (
    <div className="welcome-container">
      <div className="welcome-logo">♥</div>
      <p className="welcome-eyebrow">WELCOME SCREEN</p>
      <h1 className="welcome-title">CareQueue</h1>
      <p className="welcome-subtitle">
        Borcelle Hospital, calm, connected care from the moment you arrive
      </p>
      <button className="welcome-btn" onClick={onGetStarted}>
        Get Started
      </button>
    </div>
  );
}