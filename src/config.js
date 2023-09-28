const config = {
    // Determines spacing between trials. Specified in milliseconds, 
    // although this does not correspond precisely to the time between 
    // trials (in reality, it's more like this number + 500ms)
    iti: 3000,  
    
    // Determines the speed of the asteroid belt. Must be negative. 
    // If tweaking this, make sure that it makes it difficult for 
    // subjects to move in time to avoid getting hit once seeing 
    // the asteroid belt appear.
    asteroid_velocity: -700,  
    
    // Determines how much health is lost each time an asteroid is hit.
    asteroid_health_decrement: 0.05,  
    
    // Determines how frequently data is saved (in Hz).
    sampleRate: 2,  
    
    // Determines how quickly the score increases.
    score_increment: 10,  
    
    // Determines how quickly subjects' health increases.
    health_increase: 0.00012,  

    // The key to press for attention checks. Should be capitalised.
    attention_check_key: 'D',

    // Attention check trials
    attention_check_trials: [4, 40, 70],

    // URL to go to on completion (e.g., a link to Prolific)
    completion_url: 'https://www.completion_url.com',
};

export default config;