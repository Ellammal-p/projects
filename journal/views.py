import nltk
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import JournalEntry
from .forms import JournalForm

# Safe download of NLTK lexicon
try:
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    try:
        nltk.download('vader_lexicon', quiet=True)
    except Exception:
        pass

def analyze_sentiment(text):
    """
    NLP Sentiment Analysis helper using NLTK VADER.
    Returns (compound_score, sentiment_label).
    """
    try:
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
        sia = SentimentIntensityAnalyzer()
        scores = sia.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = 'Positive'
        elif compound <= -0.05:
            label = 'Negative'
        else:
            label = 'Neutral'
        return round(compound, 3), label
    except Exception:
        # Fallback basic keyword sentiment analyzer if NLTK asset unavailable
        pos_words = ['good', 'happy', 'great', 'joy', 'hope', 'peace', 'wonderful', 'calm', 'blessed', 'excited']
        neg_words = ['sad', 'tired', 'hopeless', 'angry', 'lonely', 'anxious', 'stress', 'pain', 'cry', 'worthless']
        
        text_lower = text.lower()
        pos_count = sum(1 for w in pos_words if w in text_lower)
        neg_count = sum(1 for w in neg_words if w in text_lower)
        
        if pos_count > neg_count:
            return 0.5, 'Positive'
        elif neg_count > pos_count:
            return -0.5, 'Negative'
        else:
            return 0.0, 'Neutral'

@login_required
def journal_list_create_view(request):
    user = request.user
    journals = JournalEntry.objects.filter(user=user).order_by('-created_at')
    
    if request.method == 'POST':
        form = JournalForm(request.POST)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.user = user
            
            # Perform NLP Sentiment Analysis
            score, label = analyze_sentiment(entry.content)
            entry.sentiment_score = score
            entry.sentiment_label = label
            
            entry.save()
            messages.success(request, f"Journal entry saved with NLP Sentiment: {label}")
            return redirect('journal_list')
    else:
        form = JournalForm()
        
    # Sentiment distribution count
    sent_counts = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
    for j in journals:
        if j.sentiment_label in sent_counts:
            sent_counts[j.sentiment_label] += 1

    context = {
        'form': form,
        'journals': journals,
        'sent_counts': sent_counts,
    }
    return render(request, 'journal/journal_list.html', context)

@login_required
def journal_edit_view(request, pk):
    entry = get_object_or_404(JournalEntry, pk=pk)
    if entry.user != request.user:
        messages.error(request, "Unauthorized access.")
        return redirect('journal_list')
        
    if request.method == 'POST':
        form = JournalForm(request.POST, instance=entry)
        if form.is_valid():
            updated_entry = form.save(commit=False)
            score, label = analyze_sentiment(updated_entry.content)
            updated_entry.sentiment_score = score
            updated_entry.sentiment_label = label
            updated_entry.save()
            messages.success(request, "Journal entry updated successfully.")
            return redirect('journal_list')
    else:
        form = JournalForm(instance=entry)
        
    return render(request, 'journal/journal_edit.html', {'form': form, 'entry': entry})

@login_required
def journal_delete_view(request, pk):
    entry = get_object_or_404(JournalEntry, pk=pk)
    if entry.user != request.user:
        messages.error(request, "Unauthorized action.")
        return redirect('journal_list')
        
    if request.method == 'POST':
        entry.delete()
        messages.success(request, "Journal entry deleted.")
    return redirect('journal_list')
