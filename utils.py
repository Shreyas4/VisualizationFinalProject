import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
import numpy as np
from collections import Counter

from sklearn import manifold
from sklearn.metrics import euclidean_distances


def pcaKmeans(df):
    cols = ['Attacking', 'Defending', 'Goalkeeping', 'Age', 'international_reputation', 'Mentality', 'Movement',
            'Overall', 'potential', 'Power', 'Skill', 'skill_moves', 'Value(EUR)', 'wage_eur']
    pca = PCA(n_components=df[cols].shape[1])
    x = MinMaxScaler().fit_transform(df[cols])
    principalComponents = pca.fit_transform(x)
    print(sum(pca.explained_variance_ratio_[:2]))
    model = KMeans(n_clusters=4).fit(principalComponents[:, :2])
    df['pc1'] = list(principalComponents[:, 0])
    df['pc2'] = list(principalComponents[:, 2])

    clstrs = list(Counter(list(model.labels_)).keys())
    clusters = list(model.labels_)
    clusters2 = list(model.labels_)
    i = 0
    for j in clstrs:
        for k in range(len(clusters)):
            if clusters2[k] == j:
                clusters[k] = i
        i += 1
    df['cluster'] = clusters
    print('\n', Counter(clusters))
    return df
