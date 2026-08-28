import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report
import xgboost as xgb
from app.services.ai.xai_explainer import XAIExplainer
from app.core.logging import logger

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


def generate_synthetic_fraud_dataset(n_samples: int = 2000):
    """
    Generates balanced synthetic KYC feature distributions across authentic and fraudulent submissions.
    """
    np.random.seed(42)

    # 1. Authentic applicants (70% of dataset)
    n_auth = int(n_samples * 0.70)
    auth_data = {
        "name_similarity": np.random.normal(92, 5, n_auth).clip(70, 100),
        "address_similarity": np.random.normal(88, 7, n_auth).clip(60, 100),
        "dob_match": np.random.choice([1.0, 0.0], p=[0.96, 0.04], size=n_auth),
        "phone_match": np.random.choice([1.0, 0.0], p=[0.97, 0.03], size=n_auth),
        "aadhaar_match": np.random.choice([1.0, 0.0], p=[0.98, 0.02], size=n_auth),
        "pan_match": np.random.choice([1.0, 0.0], p=[0.98, 0.02], size=n_auth),
        "consistency_score": np.random.normal(92, 6, n_auth).clip(75, 100),
        "face_score": np.random.normal(88, 6, n_auth).clip(70, 100),
        "liveness_score": np.random.normal(90, 5, n_auth).clip(65, 100),
        "tamper_score": np.random.exponential(8, n_auth).clip(0, 30),
        "blur_score": np.random.normal(85, 10, n_auth).clip(30, 100),
        "duplicate_count": np.zeros(n_auth),
        "aml_flag": np.zeros(n_auth),
        "is_fraud": np.zeros(n_auth)
    }

    # 2. Fraudulent applicants (30% of dataset)
    n_fraud = n_samples - n_auth
    fraud_data = {
        "name_similarity": np.random.normal(55, 15, n_fraud).clip(10, 85),
        "address_similarity": np.random.normal(45, 18, n_fraud).clip(10, 80),
        "dob_match": np.random.choice([1.0, 0.0], p=[0.40, 0.60], size=n_fraud),
        "phone_match": np.random.choice([1.0, 0.0], p=[0.50, 0.50], size=n_fraud),
        "aadhaar_match": np.random.choice([1.0, 0.0], p=[0.45, 0.55], size=n_fraud),
        "pan_match": np.random.choice([1.0, 0.0], p=[0.45, 0.55], size=n_fraud),
        "consistency_score": np.random.normal(48, 14, n_fraud).clip(10, 75),
        "face_score": np.random.normal(45, 16, n_fraud).clip(10, 70),
        "liveness_score": np.random.normal(42, 18, n_fraud).clip(10, 65),
        "tamper_score": np.random.normal(75, 15, n_fraud).clip(35, 100),
        "blur_score": np.random.normal(65, 20, n_fraud).clip(10, 95),
        "duplicate_count": np.random.choice([0.0, 1.0, 2.0, 3.0], p=[0.3, 0.4, 0.2, 0.1], size=n_fraud),
        "aml_flag": np.random.choice([0.0, 1.0], p=[0.3, 0.7], size=n_fraud),
        "is_fraud": np.ones(n_fraud)
    }

    df_auth = pd.DataFrame(auth_data)
    df_fraud = pd.DataFrame(fraud_data)
    df = pd.concat([df_auth, df_fraud], ignore_index=True).sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df


def train_xgboost_model(save_path: str = "./app/services/ai/models/xgboost_fraud_model.json"):
    logger.info("Generating synthetic training dataset...")
    df = generate_synthetic_fraud_dataset(3000)

    feature_cols = XAIExplainer.FEATURE_NAMES
    X = df[feature_cols]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    params = {
        'max_depth': 5,
        'learning_rate': 0.05,
        'n_estimators': 150,
        'objective': 'binary:logistic',
        'eval_metric': 'auc',
        'subsample': 0.85,
        'colsample_bytree': 0.85,
        'random_state': 42
    }

    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    preds_proba = model.predict_proba(X_test)[:, 1]
    preds_binary = (preds_proba >= 0.5).astype(int)

    auc = roc_auc_score(y_test, preds_proba)
    acc = accuracy_score(y_test, preds_binary)

    logger.info(f"XGBoost Model Evaluation -> ROC-AUC: {auc:.4f}, Accuracy: {acc:.4f}")
    logger.info("\n" + classification_report(y_test, preds_binary))

    os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
    model.save_model(save_path)
    logger.info(f"Saved trained XGBoost fraud model to {save_path}")

    # SHAP Explainer analysis
    if SHAP_AVAILABLE:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_test.iloc[:50])
            logger.info("SHAP TreeExplainer initialized successfully.")
        except Exception as e:
            logger.warning(f"SHAP explanation check: {e}")


if __name__ == "__main__":
    train_xgboost_model()
