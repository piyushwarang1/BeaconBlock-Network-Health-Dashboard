import streamlit as st
import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import plotly.graph_objects as go
import plotly.express as px

# Mock community data (simulate fetching from APIs)
dates = pd.date_range(start='2023-10-01', periods=30, freq='D')
np.random.seed(42)

# Mock posts with topics
topics = ['staking', 'upgrades', 'governance', 'parachains']
posts_x = [f"Polkadot {np.random.choice(topics)} is amazing!" if np.random.random() > 0.3 else f"Polkadot {np.random.choice(topics)} has issues!" for _ in range(300)]
posts_github = [f"Issue with {np.random.choice(topics)} in polkadot-sdk" for _ in range(100)]
posts_forum = [f"Discussion on {np.random.choice(topics)} at discuss.polkadot.network" for _ in range(200)]

# Combine with dates
all_posts = posts_x + posts_github + posts_forum
sources = ['X'] * len(posts_x) + ['GitHub'] * len(posts_github) + ['Forum'] * len(posts_forum)
post_dates = np.random.choice(dates, len(all_posts))
post_topics = [np.random.choice(topics) for _ in all_posts]

df_posts = pd.DataFrame({'date': post_dates, 'text': all_posts, 'source': sources, 'topic': post_topics})

# Sentiment analysis
analyzer = SentimentIntensityAnalyzer()
df_posts['sentiment'] = df_posts['text'].apply(lambda x: analyzer.polarity_scores(x)['compound'])

# Aggregate daily sentiment
daily_sentiment = df_posts.groupby('date')['sentiment'].mean().reset_index()

# Mock network metrics
block_time = 6 + np.random.normal(0, 0.5, 30)
node_count = 1000 + np.cumsum(np.random.normal(0, 10, 30))
df_network = pd.DataFrame({'date': dates, 'block_time': block_time, 'node_count': node_count})

# Merge
df = pd.merge(daily_sentiment, df_network, on='date', how='outer').fillna(0)

# Streamlit app
st.title("Polkadot Community Sentiment Overlay Prototype")
st.markdown("NLP-driven sentiment analysis from X, GitHub, Forums overlaid with network metrics.")

# Filters
source_filter = st.multiselect("Filter by Source", ['X', 'GitHub', 'Forum'], default=['X', 'GitHub', 'Forum'])
topic_filter = st.multiselect("Filter by Topic", topics, default=topics)

filtered_df = df_posts[df_posts['source'].isin(source_filter) & df_posts['topic'].isin(topic_filter)]
filtered_daily = filtered_df.groupby('date')['sentiment'].mean().reset_index()
df_filtered = pd.merge(filtered_daily, df_network, on='date', how='outer').fillna(0)

# Timeline visualization
fig = go.Figure()
fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['sentiment'], mode='lines+markers', name='Avg Sentiment', yaxis='y1'))
fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['block_time'], mode='lines', name='Block Time (s)', yaxis='y2'))
fig.update_layout(yaxis=dict(title='Sentiment Score'), yaxis2=dict(title='Block Time', overlaying='y', side='right'))
st.plotly_chart(fig)

# Heatmap by topic
topic_sentiment = filtered_df.groupby('topic')['sentiment'].mean().reset_index()
fig_heat = px.bar(topic_sentiment, x='topic', y='sentiment', title='Sentiment by Topic')
st.plotly_chart(fig_heat)

# Alerts
avg_sentiment = df_filtered['sentiment'].mean()
if avg_sentiment < -0.2:
    st.error("🚨 High negative sentiment detected - potential community dissatisfaction!")

st.markdown("""
**Notes:**
- Mock data used; integrate real APIs (Tweepy for X, PyGitHub for GitHub, RSS for forums).
- Enhances governance by correlating sentiment spikes with network events (e.g., upgrades).
- Dependencies: streamlit, pandas, numpy, vaderSentiment, plotly.
- Run: `pip install -r requirements.txt && streamlit run sentiment_overlay.py`
""")