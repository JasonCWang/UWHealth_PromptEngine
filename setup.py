from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as readme_file:
    readme = readme_file.read()

requirements = [
    "black<=21.12b0",
    "datasets>=1.7.0",
    "flake8",
    "isort==5.8.0",
    "pytest",
    "pyyaml>=5",
    "streamlit==1.26.0",
    "jinja2",
    "plotly",
    "requests",
    "pandas",
    "betterprompt",
]

setup(
    name='uwhealthpromptengine',
    version='0.0.0',
    url='https://github.com/JasonCWang/UWHealth_PromptEngine',
    author='BigScience, UW-Madison',
    author_email='sbach@cs.brown.edu,victor@huggingface.co',
    install_requires=requirements,
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Apache Software License',
        'Natural Language :: English',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
    ],
    description='An Integrated Development Environment and Repository for Natural Language Prompts.',
    packages=find_packages(),
    license="Apache Software License 2.0",
    long_description=readme,
    long_description_content_type="text/markdown",
    package_data={"": [
        "templates/*/*.yaml",
        "templates/*/*/*.yaml",
    ]}
)
