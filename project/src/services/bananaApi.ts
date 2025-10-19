export interface BananaPuzzle {
  solution: number;
  question: string;
}

export async function fetchBananaPuzzle(): Promise<BananaPuzzle> {
  try {
    const response = await fetch(
      'https://marcconrad.com/uob/banana/api.php?out=json&base64=no'
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.solution === undefined || !data.question) {
      throw new Error('Invalid API response format');
    }

    return {
      solution: parseInt(data.solution, 10),
      question: data.question,
    };
  } catch (error) {
    console.error('Error fetching banana puzzle:', error);
    throw new Error('Failed to load puzzle. Please try again.');
  }
}
