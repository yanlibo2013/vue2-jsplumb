//字体图标的变量（需跟iconFont字体包同步）
var nodeIconFont = {
    "source": "source",
    "sqlsource": "sqlsource",
    "sink": "sink",
    "decision": "decision",
    "validate": "validate",
    "supplement": "supplement",
    "sql": "sql",
    "transform": "transform",
    "filter": "filter",
    "sample": "sample",
    "lookup": "lookup",
    "join": "join",
    "starjoin": "starjoin",
    "productjoin": "productjoin",
    "aggregate": "aggregate",
    "top": "top",
    "union": "union",
    "intersect": "intersect",
    "minus": "minus",
    "split": "split",
    "Correlation": "Correlation",
    "Summary": "Summary",
    "decisiontree_predict": "decisiontree_predict",
    "decisiontree_train": "decisiontree_train",
    "gradientboogradientbostedtrees_predict": "gradientboogradientbostedtrees_predict",
    "MultilayerPerceptronPredict": "MultilayerPerceptronPredict",
    "MultilayerPerceptronTrain": "MultilayerPerceptronTrain",
    "kmeans_predict": "kmeans_predict",
    "kmeans_train": "kmeans_train"
}
//节点图标函数
export function nodeIcon(type) {
    if (type in nodeIconFont) {
        return "iconTrue";
    } else {
        return false;
    }
}