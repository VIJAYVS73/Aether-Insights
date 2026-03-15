#!/usr/bin/env python3
"""
AI-powered Market Analysis Service
Generates market insights using transformer models
"""

import json
import sys
from typing import List, Dict, Any

def generate_market_insights(products_data: List[Dict[str, Any]], market_segment: str = "general") -> Dict[str, Any]:
    """
    Generate market analysis insights from product data
    """
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        import torch
    except ImportError:
        print("Error: transformers library not installed. Install with: pip install transformers torch", file=sys.stderr)
        return {"error": "Dependencies not installed"}
    
    try:
        # Load model and tokenizer
        print("Loading model... this may take a moment on first run", file=sys.stderr)
        tokenizer = AutoTokenizer.from_pretrained("openai/gpt-oss-120b")
        model = AutoModelForCausalLM.from_pretrained("openai/gpt-oss-120b")
        
        # Prepare product summary
        top_products = sorted(products_data, key=lambda x: x.get('reviews', 0), reverse=True)[:5]
        products_summary = "\n".join([
            f"- {p.get('title', 'Unknown')}: {p.get('reviews', 0)} reviews, ₹{p.get('price', 'N/A')}, {p.get('rating', 'N/A')}★"
            for p in top_products
        ])
        
        # Create analysis prompt
        prompt = f"""Analyze the following market segment data and provide actionable insights:

Market Segment: {market_segment}

Top Products:
{products_summary}

Provide a brief market analysis including:
1. Market trends
2. Opportunities
3. Competitive advantages
4. Recommended actions

Keep response concise (max 150 words)."""
        
        # Generate insights
        messages = [
            {"role": "user", "content": prompt},
        ]
        
        inputs = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(model.device)
        
        outputs = model.generate(**inputs, max_new_tokens=150, temperature=0.7, top_p=0.9)
        insight_text = tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:])
        
        return {
            "status": "success",
            "segment": market_segment,
            "insights": insight_text.strip(),
            "products_analyzed": len(top_products),
            "top_products": [
                {
                    "title": p.get('title', 'Unknown'),
                    "reviews": p.get('reviews', 0),
                    "price": p.get('price', 'N/A'),
                    "rating": p.get('rating', 'N/A')
                }
                for p in top_products
            ]
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to generate insights"
        }


def generate_demand_forecast(historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate demand forecast using AI analysis
    """
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
    except ImportError:
        return {"error": "Dependencies not installed"}
    
    try:
        print("Generating demand forecast...", file=sys.stderr)
        tokenizer = AutoTokenizer.from_pretrained("openai/gpt-oss-120b")
        model = AutoModelForCausalLM.from_pretrained("openai/gpt-oss-120b")
        
        # Analyze historical trends
        avg_rating = sum(d.get('rating', 0) for d in historical_data) / len(historical_data) if historical_data else 0
        total_reviews = sum(d.get('reviews', 0) for d in historical_data)
        price_range = f"₹{min(d.get('price', 0) for d in historical_data)}-₹{max(d.get('price', 0) for d in historical_data)}"
        
        prompt = f"""Based on this historical market data, forecast demand trends:

Market Statistics:
- Total Reviews: {total_reviews}
- Average Rating: {avg_rating:.1f}★
- Price Range: {price_range}
- Products Analyzed: {len(historical_data)}

Provide demand forecast including:
1. Predicted trend (up/stable/down)
2. Key growth drivers
3. Risk factors
4. 30-day outlook

Keep under 100 words."""
        
        messages = [
            {"role": "user", "content": prompt},
        ]
        
        inputs = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(model.device)
        
        outputs = model.generate(**inputs, max_new_tokens=100)
        forecast = tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:])
        
        return {
            "status": "success",
            "forecast": forecast.strip(),
            "avg_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "products_count": len(historical_data)
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) > 1:
        command = sys.argv[1]
        data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []
        
        if command == "analyze":
            result = generate_market_insights(data)
        elif command == "forecast":
            result = generate_demand_forecast(data)
        else:
            result = {"error": "Unknown command"}
        
        print(json.dumps(result))
    else:
        print("Usage: python ai_market_analysis.py <analyze|forecast> <json_data>")
