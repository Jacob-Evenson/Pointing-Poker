import React from 'react';
import './IntermediaryPage.css';
import banner from '../src/assets/banner.jpeg';


const IntermediaryPage = () => {
  return (
    <div className="page-wrapper">

      {/* Header */}
      <header className="game-header">
        <div className="game-shell game-header-content">
          <a href="/" className="brand">
            <img className="header-banner" src={banner} alt="Pointing Poker" />
          </a>

          <nav className="header-nav">
            <a href="/">Home</a>
            <a href="/sessions">Sessions</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="game-main">
        <div className="join-card">

          {/* People icon */}
          <div className="join-icon">
            <svg
              viewBox="0 0 24 24"
              width="27"
              height="27"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              <path d="M19 12c1.66 0 3-1.34 3-3s-1.34-3-3-3c-.38 0-.74.08-1.07.21a5.97 5.97 0 0 1 0 5.58c.33.13.69.21 1.07.21z" />
            </svg>
          </div>

          <p className="eyebrow">JOIN SESSION</p>

          <h1 className="join-title">
            Enter your username
          </h1>

          <p className="join-subtitle">
            Choose the name that will appear in the
            <br />
            estimation session.
          </p>

          {/* Username form */}
          <form
            className="join-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="input-wrap">

              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>

              <input
                id="Session-Name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                required
              />

            </div>

            <button
              className="join-button"
              type="submit"
            >
              <span>Join Session</span>

              <span className="button-arrow">
                →
              </span>
            </button>
          </form>

          {/* Session information */}
          <div className="session-divider">

            <span className="divider-line"></span>

            <span className="session-label">
              Joining session
            </span>

            <strong className="session-code">
              JACOBS-26
            </strong>

            <span className="divider-line"></span>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <p>
            Pointing Poker Built by Jacobs minions IT project management team
          </p>

          <p>
            © 2026 Jacobs Minions. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default IntermediaryPage;