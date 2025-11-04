<script>
  import {
    ipToBinary,
    validateIpAddress,
    isIpInNetwork,
    generateRandomSubnetMask,
    explainNetworkMismatch
  } from './utils/ipUtils.js';

  // Game state
  let networkAddress = '';
  let subnetMask = '';
  let userInput = '';
  let score = 0;
  let correctAnswers = 0;
  let totalAttempts = 0;
  let gameCompleted = false;
  let submissions = [];
  let currentResponse = null;
  let errorMessage = '';
  let waitingForContinue = false;

  // Initialize game
  function initGame() {
    subnetMask = generateRandomSubnetMask();
    // Generate a random network address
    const randomIp = [
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      0
    ].join('.');
    networkAddress = randomIp;
    userInput = '';
    errorMessage = '';
    currentResponse = null;
    waitingForContinue = false;
  }

  // Continue to next question after correct answer
  function continueToNextQuestion() {
    if (correctAnswers < 5) {
      initGame();
    }
  }

  // Initialize on mount
  initGame();

  function generateResponse(isCorrect, message, userIp = null, userSubnet = null) {
    const ipToUse = userIp || userInput;
    const response = {
      providedIpAddress: {
        decimal: ipToUse,
        binary: ipToUse ? ipToBinary(ipToUse) : ''
      },
      providedSubnetMask: {
        decimal: userSubnet || subnetMask,
        binary: ipToBinary(userSubnet || subnetMask)
      },
      currentNetworkAddress: {
        decimal: networkAddress,
        binary: ipToBinary(networkAddress)
      },
      currentSubnetMask: {
        decimal: subnetMask,
        binary: ipToBinary(subnetMask)
      },
      isCorrect: isCorrect,
      currentScore: score,
      totalQuestionsAttempted: totalAttempts,
      message: message
    };

    return response;
  }

  function handleSubmit() {
    errorMessage = '';
    totalAttempts++;

    // Validate input format and normalize
    const ipValidation = validateIpAddress(userInput);
    if (!ipValidation.valid) {
      errorMessage = ipValidation.error;
      currentResponse = generateResponse(false, `Validation error: ${ipValidation.error}`);
      submissions.push({
        ...currentResponse,
        attemptNumber: totalAttempts
      });
      return;
    }

    // Use normalized IP address
    const normalizedIp = ipValidation.normalizedIp || userInput;
    
    // Check if IP is in the network
    const correct = isIpInNetwork(normalizedIp, networkAddress, subnetMask);
    
    if (correct) {
      score++;
      correctAnswers++;
      currentResponse = generateResponse(true, `Correct! The IP address ${normalizedIp} belongs to the network ${networkAddress}/${subnetMask}`, normalizedIp);
      
      if (correctAnswers >= 5) {
        gameCompleted = true;
        currentResponse.message += ' Game completed!';
      } else {
        // Wait for user to click continue button
        waitingForContinue = true;
      }
    } else {
      const explanation = explainNetworkMismatch(normalizedIp, networkAddress, subnetMask);
      currentResponse = generateResponse(false, explanation, normalizedIp);
    }

    submissions.push({
      ...currentResponse,
      attemptNumber: totalAttempts
    });

    // Clear input if incorrect
    if (!correct) {
      userInput = '';
    }
  }

  function handleReset() {
    score = 0;
    correctAnswers = 0;
    totalAttempts = 0;
    gameCompleted = false;
    submissions = [];
    currentResponse = null;
    errorMessage = '';
    waitingForContinue = false;
    initGame();
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !gameCompleted) {
      handleSubmit();
    }
  }

  function getFinalResults() {
    return {
      gameCompleted: true,
      totalScore: score,
      totalCorrectAnswers: correctAnswers,
      totalQuestionsAttempted: totalAttempts,
      allSubmissions: submissions.map(sub => ({
        attemptNumber: sub.attemptNumber,
        providedIpAddress: sub.providedIpAddress,
        providedSubnetMask: sub.providedSubnetMask,
        isCorrect: sub.isCorrect,
        message: sub.message,
        scoreAtAttempt: sub.currentScore
      }))
    };
  }
</script>

<div class="container">
  <h1>IP Subnet Game</h1>

  {#if !gameCompleted}
    <!-- Network Information -->
    <div class="network-info">
      <h3>Current Network</h3>
      <div class="info-row">
        <span class="info-label">Network Address:</span>
        <span class="info-value">Decimal: {networkAddress}</span>
        <span class="info-value">Binary: {ipToBinary(networkAddress)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Subnet Mask:</span>
        <span class="info-value">Decimal: {subnetMask}</span>
        <span class="info-value">Binary: {ipToBinary(subnetMask)}</span>
      </div>
    </div>

    <!-- Score Section -->
    <div class="score-section">
      <div class="score-item">
        <div class="score-label">Score</div>
        <div class="score-value">{score}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Correct Answers</div>
        <div class="score-value">{correctAnswers}/5</div>
      </div>
      <div class="score-item">
        <div class="score-label">Total Attempts</div>
        <div class="score-value">{totalAttempts}</div>
      </div>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <div class="input-group">
        <label for="ip-input">Enter an IP address that belongs to the network:</label>
        <input
          id="ip-input"
          type="text"
          bind:value={userInput}
          placeholder="e.g., 192.168.1.10"
          on:keypress={handleKeyPress}
          disabled={gameCompleted || waitingForContinue}
        />
      </div>
      {#if errorMessage}
        <div class="response-section error">
          <div class="response-title">Error</div>
          <div>{errorMessage}</div>
        </div>
      {/if}
      <div class="button-group">
        {#if waitingForContinue}
          <button class="btn-continue" on:click={continueToNextQuestion}>
            Continue to Next Question
          </button>
        {:else}
          <button class="btn-submit" on:click={handleSubmit} disabled={gameCompleted || !userInput.trim()}>
            Submit
          </button>
        {/if}
        <button class="btn-reset" on:click={handleReset}>Reset Game</button>
      </div>
    </div>

    <!-- Response Section -->
    {#if currentResponse}
      <div class="response-section" class:success={currentResponse.isCorrect} class:error={!currentResponse.isCorrect}>
        <div class="response-title">
          {currentResponse.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </div>
        {#if !currentResponse.isCorrect && currentResponse.message && !currentResponse.message.startsWith('Validation error')}
          <div class="response-content explanation" style="margin-bottom: 15px;">
            {currentResponse.message}
          </div>
        {/if}
        <div class="response-content">
          {JSON.stringify(currentResponse, null, 2)}
        </div>
      </div>
    {/if}
  {:else}
    <!-- Final Results -->
    <div class="final-results">
      <h2>Game Complete! 🎉</h2>
      
      <div class="results-summary">
        <div class="score-item">
          <div class="score-label">Final Score</div>
          <div class="score-value">{score}</div>
        </div>
        <div class="score-item">
          <div class="score-label">Correct Answers</div>
          <div class="score-value">{correctAnswers}/5</div>
        </div>
        <div class="score-item">
          <div class="score-label">Total Attempts</div>
          <div class="score-value">{totalAttempts}</div>
        </div>
      </div>

      <div class="response-section info">
        <div class="response-title">Final Results (JSON)</div>
        <div class="response-content">
          {JSON.stringify(getFinalResults(), null, 2)}
        </div>
      </div>

      <div class="submissions-list">
        <h3 style="margin-bottom: 15px; color: #333;">All Submissions</h3>
        {#each submissions as submission}
          <div class="submission-item" class:correct={submission.isCorrect} class:incorrect={!submission.isCorrect}>
            <div class="submission-header">
              <span class="submission-number">Attempt #{submission.attemptNumber}</span>
              <span class="submission-status" class:correct={submission.isCorrect} class:incorrect={!submission.isCorrect}>
                {submission.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div class="submission-details">
              <div><strong>IP Address:</strong> {submission.providedIpAddress.decimal} ({submission.providedIpAddress.binary})</div>
              <div><strong>Subnet Mask:</strong> {submission.providedSubnetMask.decimal} ({submission.providedSubnetMask.binary})</div>
              <div><strong>Score:</strong> {submission.currentScore}</div>
              <div><strong>Message:</strong> {submission.message}</div>
            </div>
          </div>
        {/each}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <button class="btn-reset" on:click={handleReset}>Play Again</button>
      </div>
    </div>
  {/if}
</div>

