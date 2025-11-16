import json
import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

def sentiment(event, context):
    # Mock community data
    dates = pd.date_range(start='2023-10-01', periods=30, freq='D')
    np.random.seed(42)

    topics = ['staking', 'upgrades', 'governance', 'parachains']
    posts_x = [f"Polkadot {np.random.choice(topics)} is amazing!" if np.random.random() > 0.3 else f"Polkadot {np.random.choice(topics)} has issues!" for _ in range(300)]
    posts_github = [f"Issue with {np.random.choice(topics)} in polkadot-sdk" for _ in range(100)]
    posts_forum = [f"Discussion on {np.random.choice(topics)} at discuss.polkadot.network" for _ in range(200)]

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

    # Timeline plot
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df['date'], y=df['sentiment'], mode='lines+markers', name='Avg Sentiment'))
    fig.add_trace(go.Scatter(x=df['date'], y=df['block_time'], mode='lines', name='Block Time (s)', yaxis='y2'))
    fig.update_layout(yaxis=dict(title='Sentiment Score'), yaxis2=dict(title='Block Time', overlaying='y', side='right'))

    # Heatmap
    topic_sentiment = df_posts.groupby('topic')['sentiment'].mean().reset_index()
    fig_heat = px.bar(topic_sentiment, x='topic', y='sentiment', title='Sentiment by Topic')

    # Alerts
    alerts = []
    if df['sentiment'].mean() < -0.2:
        alerts.append("High negative sentiment detected - potential community dissatisfaction!")

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'timeline_plot': json.loads(json.dumps(fig, cls=PlotlyJSONEncoder)),
            'heatmap_plot': json.loads(json.dumps(fig_heat, cls=PlotlyJSONEncoder)),
            'alerts': alerts
        })
    }