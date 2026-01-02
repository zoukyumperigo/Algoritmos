"""
Setup script para Invoice Confirmation App
"""
from setuptools import setup, find_packages
from pathlib import Path

# Ler README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding='utf-8') if readme_file.exists() else ""

# Ler requirements
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    with open(requirements_file, 'r', encoding='utf-8') as f:
        requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name="invoice-confirmation-app",
    version="1.0.0",
    description="Sistema de validação automática de faturas SAGE vs pedidos WhatsApp",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Invoice Confirmation Team",
    author_email="suporte@empresa.pt",
    url="https://github.com/empresa/invoice-confirmation-app",
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'invoice-app=main:main',
        ],
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Office/Business :: Financial",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: Microsoft :: Windows",
    ],
    python_requires='>=3.10',
)
