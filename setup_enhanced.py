#!/usr/bin/env python3
"""
Setup and Test Script for Enhanced AI Detector
==============================================

This script installs dependencies and tests the enhanced AI detection system.
"""

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Install Python dependencies"""
    print("🔧 Installing Python dependencies...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def test_imports():
    """Test if all required packages can be imported"""
    print("🧪 Testing package imports...")
    
    required_packages = [
        'torch',
        'torchvision', 
        'numpy',
        'cv2',
        'scipy',
        'PIL',
        'matplotlib',
        'albumentations',
        'sklearn'
    ]
    
    failed_imports = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError as e:
            print(f"  ❌ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("\n✅ All packages imported successfully!")
        return True

def test_enhanced_detector():
    """Test the enhanced detector with a dummy image"""
    print("🤖 Testing Enhanced AI Detector...")
    
    try:
        # Import the enhanced detector
        sys.path.append(str(Path(__file__).parent / "lib"))
        from enhanced_ai_detector import create_enhanced_detector
        import numpy as np
        
        # Create detector instance
        detector = create_enhanced_detector()
        print("  ✅ Detector created successfully")
        
        # Create dummy image
        dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        print("  ✅ Dummy image created")
        
        # Test prediction
        result = detector.predict(dummy_image, return_heatmap=True)
        print("  ✅ Prediction completed")
        
        print(f"  📊 Results:")
        print(f"    - Prediction: {result['prediction']}")
        print(f"    - Confidence: {result['confidence']:.3f}")
        print(f"    - Is Certain: {result['is_certain']}")
        print(f"    - Has Heatmap: {'heatmap' in result and result['heatmap'] is not None}")
        
        # Test feedback system
        detector.add_feedback(dummy_image, ground_truth=1, user_feedback=1)
        print("  ✅ Feedback system tested")
        
        # Test incremental training (with minimal data)
        detector.incremental_train(num_epochs=1)
        print("  ✅ Incremental training tested")
        
        print("\n🎉 Enhanced AI Detector is working correctly!")
        return True
        
    except Exception as e:
        print(f"\n❌ Enhanced detector test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_system_requirements():
    """Check system requirements"""
    print("🔍 Checking system requirements...")
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print(f"❌ Python 3.8+ required, found {python_version.major}.{python_version.minor}")
        return False
    else:
        print(f"  ✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check available memory (rough estimate)
    try:
        import psutil
        memory_gb = psutil.virtual_memory().total / (1024**3)
        if memory_gb < 4:
            print(f"⚠️  Low memory detected: {memory_gb:.1f}GB (4GB+ recommended)")
        else:
            print(f"  ✅ Memory: {memory_gb:.1f}GB")
    except ImportError:
        print("  ⚠️  Could not check memory (psutil not available)")
    
    # Check GPU availability
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"  ✅ GPU available: {gpu_name}")
        else:
            print("  ℹ️  GPU not available, will use CPU")
    except ImportError:
        print("  ⚠️  Could not check GPU (torch not available)")
    
    return True

def main():
    """Main setup and test function"""
    print("🚀 Enhanced AI Forensics Setup and Test")
    print("=" * 50)
    
    # Check system requirements
    if not check_system_requirements():
        print("\n❌ System requirements not met")
        sys.exit(1)
    
    print()
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Dependency installation failed")
        sys.exit(1)
    
    print()
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed")
        sys.exit(1)
    
    print()
    
    # Test enhanced detector
    if not test_enhanced_detector():
        print("\n❌ Enhanced detector tests failed")
        sys.exit(1)
    
    print("\n" + "="*50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Run 'npm run dev' to start the Next.js server")
    print("2. Upload an image to test the enhanced AI detection")
    print("3. Check the console for detailed analysis logs")
    print("4. Use the feedback system to improve model accuracy")

if __name__ == "__main__":
    main()